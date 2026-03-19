import crypto from "crypto";
import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongoose";
import { Booking, Payment, AvailabilitySlot, User, MentorProfile } from "@/models";
import { sendBookingMail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = body;

    // VALIDATION
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json({
        success: false,
        error: "Missing payment details"
      });
    }

    // VERIFY SIGNATURE
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({
        success: false,
        error: "Payment verification failed"
      });
    }

    // FIND BOOKING + RELATIONS
    const booking = await Booking.findById(bookingId)
      .populate({ path: "studentId", model: User, select: "name email" })
      .populate({
        path: "mentorId",
        model: MentorProfile,
        populate: { path: "userId", model: User, select: "name email" }
      })
      .populate("slotId");

    if (!booking) {
      console.error("Booking not found for ID:", bookingId);
      return NextResponse.json({
        success: false,
        error: "Booking not found"
      });
    }

    const student = booking.studentId as any;
    const mentorProfile = booking.mentorId as any;
    const mentor = mentorProfile?.userId as any;

    console.log("Found booking details:", {
      status: booking.status,
      studentEmail: student?.email,
      mentorEmail: mentor?.email,
      mentorName: mentor?.name
    });

    // PREVENT DOUBLE CONFIRM
    if (booking.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        message: "Booking already confirmed"
      });
    }

    // UPDATE PAYMENT RECORD
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        status: "SUCCESS"
      },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({
        success: false,
        error: "Payment record not found"
      });
    }

    // SAFE SLOT LOCK (prevents race condition)
    const lockedSlot = await AvailabilitySlot.findOneAndUpdate(
      { _id: booking.slotId, isBooked: false },
      { isBooked: true },
      { new: true }
    );

    if (!lockedSlot) {
      return NextResponse.json({
        success: false,
        error: "Slot already booked"
      });
    }

    // CONFIRM BOOKING
    booking.status = "CONFIRMED";
    booking.paymentId = payment._id;

    await booking.save();

    // EXTRACT POPULATED DATA
    const slot = booking.slotId as any;

    const studentEmail = student?.email;
    const mentorEmail = mentor?.email;
    const studentName = student?.name || "Student";
    const mentorName = mentor?.name || "Mentor";

    if (!studentEmail || !mentorEmail) {
      console.warn("Missing email addresses for booking notification:", { studentEmail, mentorEmail });
    }

    const startTime = new Date(slot.startTime).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    const endTime = new Date(slot.endTime).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });

    const formattedDate = new Date(slot.startTime).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    // SEND EMAIL SAFELY
    try {
      console.log("Preparing to send booking mail via Nodemailer...");
      await sendBookingMail({
        studentEmail,
        mentorEmail,
        studentName,
        mentorName,
        date: formattedDate,
        time: `${startTime} - ${endTime}`
      });
      console.log("Nodemailer sendBookingMail call completed.");
    } catch (emailError) {
      console.error("Email sending failed in verify-payment route:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and booking confirmed"
    });

  } catch (error: any) {
    console.error("Verify Payment Error:", error);

    return NextResponse.json({
      success: false,
      error: "Payment verification failed",
      details: error.message
    });
  }
}