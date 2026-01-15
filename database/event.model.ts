import mongoose, { type Document, type Model, Schema } from 'mongoose';

/**
 * Interface defining the structure of an Event document.
 * Extends mongoose.Document to include Mongoose-specific properties.
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for the Event model with static methods.
 */
interface IEventModel extends Model<IEvent> {
  // Add static methods here if needed in the future
}

/**
 * Mongoose schema definition for Event.
 * Defines field types, validation rules, and indexes.
 */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Title cannot be empty',
      },
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Description cannot be empty',
      },
    },
    overview: {
      type: String,
      required: [true, 'Overview is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Overview cannot be empty',
      },
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Image cannot be empty',
      },
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Venue cannot be empty',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Location cannot be empty',
      },
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be one of: online, offline, hybrid',
      },
    },
    audience: {
      type: String,
      required: [true, 'Audience is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Audience cannot be empty',
      },
    },
    agenda: {
      type: [String],
      required: [true, 'Agenda is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Organizer is required'],
      trim: true,
      validate: {
        validator: (value: string) => value.length > 0,
        message: 'Organizer cannot be empty',
      },
    },
    tags: {
      type: [String],
      required: [true, 'Tags is required'],
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

/**
 * Generates a URL-friendly slug from a given string.
 * Converts to lowercase, replaces spaces and special characters with hyphens,
 * and removes consecutive hyphens.
 *
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalizes a date string to ISO format (YYYY-MM-DD).
 * Handles various input formats and converts them to a consistent format.
 *
 * @param dateString - The date string to normalize
 * @returns A normalized date string in ISO format
 * @throws Error if the date string is invalid
 */
function normalizeDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD part
}

/**
 * Normalizes a time string to HH:MM format.
 * Handles various input formats (with/without seconds, 12/24 hour format).
 *
 * @param timeString - The time string to normalize
 * @returns A normalized time string in HH:MM format
 * @throws Error if the time string is invalid
 */
function normalizeTime(timeString: string): string {
  const trimmed = timeString.trim();
  
  // Try to parse as Date to handle various formats
  const testDate = new Date(`2000-01-01T${trimmed}`);
  if (!isNaN(testDate.getTime())) {
    const hours = testDate.getHours().toString().padStart(2, '0');
    const minutes = testDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // If Date parsing fails, try to extract HH:MM pattern
  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*(AM|PM))?$/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2].padStart(2, '0');
    const period = timeMatch[3]?.toUpperCase();
    
    // Convert 12-hour to 24-hour format
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  
  throw new Error(`Invalid time format: ${timeString}`);
}

/**
 * Pre-save hook that runs before saving an Event document.
 * - Generates a slug from the title if the title has changed or slug doesn't exist
 * - Normalizes the date to ISO format
 * - Normalizes the time to HH:MM format
 */
EventSchema.pre('save', function (next) {
  const event = this as IEvent;
  const callback = next as (err?: Error) => void;
  
  // Generate slug only if title changed or slug doesn't exist
  if (event.isModified('title') || !event.slug) {
    event.slug = generateSlug(event.title);
  }
  
  // Normalize date to ISO format
  if (event.isModified('date')) {
    try {
      event.date = normalizeDate(event.date);
    } catch (error) {
      return callback(error as Error);
    }
  }
  
  // Normalize time to consistent format
  if (event.isModified('time')) {
    try {
      event.time = normalizeTime(event.time);
    } catch (error) {
      return callback(error as Error);
    }
  }
  
  callback();
});

// Create unique index on slug for fast lookups and uniqueness enforcement
EventSchema.index({ slug: 1 }, { unique: true });

/**
 * Mongoose model for Event documents.
 * Uses the schema and interface defined above.
 */
export const Event: IEventModel = mongoose.models.Event || mongoose.model<IEvent, IEventModel>('Event', EventSchema);
