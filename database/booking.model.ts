import mongoose, { type Document, type Model, Schema, Types } from 'mongoose';
import { Event } from './event.model';

/**
 * Interface defining the structure of a Booking document.
 * Extends mongoose.Document to include Mongoose-specific properties.
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for the Booking model with static methods.
 */
interface IBookingModel extends Model<IBooking> {
  // Add static methods here if needed in the future
}

/**
 * Mongoose schema definition for Booking.
 * Defines field types, validation rules, and indexes.
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries on eventId
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string) => {
          // Email validation regex pattern
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Pre-save hook that runs before saving a Booking document.
 * Verifies that the referenced eventId corresponds to an existing Event.
 * Throws an error if the event does not exist.
 */
BookingSchema.pre('save', async function (next) {
  const booking = this as IBooking;
  const callback = next as (err?: Error) => void;
  
  // Only validate if eventId is being set or modified
  if (booking.isModified('eventId')) {
    try {
      const event = await Event.findById(booking.eventId);
      if (!event) {
        return callback(new Error(`Event with ID ${booking.eventId} does not exist`));
      }
    } catch (error) {
      return callback(error as Error);
    }
  }
  
  callback();
});

// Create indexes for faster queries
BookingSchema.index({ eventId: 1 });

// Create compound index for common queries (event bookings by date)
BookingSchema.index({eventId: 1, createdAt: -1 });

// Create index on email for user bookings lookups
BookingSchema.index({ email: 1 });

/**
 * Mongoose model for Booking documents.
 * Uses the schema and interface defined above.
 */
export const Booking: IBookingModel = mongoose.models.Booking || mongoose.model<IBooking, IBookingModel>('Booking', BookingSchema);
