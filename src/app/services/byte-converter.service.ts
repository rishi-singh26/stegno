// Enum for Size Units
export enum SizeUnit {
  TB = 'tb',
  GB = 'gb',
  MB = 'mb',
  KB = 'kb',
  B = 'b',
}

export class ByteConverterService {
  bytes: number = 0.0;
  bits: number = 0;

  // Constructor to initialize from bytes
  constructor(bytes: number = 0, bits: number = 0) {
    if (bytes !== 0) {
      this.bytes = bytes;
      this.bits = Math.ceil(bytes * 8);
    } else if (bits !== 0) {
      this.bits = bits;
      this.bytes = bits / 8;
    }
  }

  // Factory methods for creating service from different units
  static fromBytes(bytes: number): ByteConverterService {
    return new ByteConverterService(bytes);
  }

  static fromBits(bits: number): ByteConverterService {
    return new ByteConverterService(0, bits);
  }

  // Helper method to round off to a specific precision
  private _withPrecision(value: number, precision: number = 2): number {
    return parseFloat(value.toFixed(precision));
  }

  // Getters for different units
  get kiloBytes(): number {
    return this.bytes / 1000;
  }

  get megaBytes(): number {
    return this.bytes / 1000000;
  }

  get gigaBytes(): number {
    return this.bytes / 1000000000;
  }

  get teraBytes(): number {
    return this.bytes / 1000000000000;
  }

  get petaBytes(): number {
    return this.bytes / 1e15;
  }

  // Return the bytes value with precision
  asBytes(precision: number = 2): number {
    return this._withPrecision(this.bytes, precision);
  }

  // Static methods for different conversions from Kibibytes, Mebibytes, etc.
  static fromKibiBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1024);
  }

  static fromMebiBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1048576);
  }

  static fromGibiBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1073741824);
  }

  static fromTebiBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1099511627776);
  }

  static fromPebiBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1125899906842624);
  }

  static fromKiloBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1000);
  }

  static fromMegaBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1000000);
  }

  static fromGigaBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1000000000);
  }

  static fromTeraBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1000000000000);
  }

  static fromPetaBytes(value: number): ByteConverterService {
    return ByteConverterService.fromBytes(value * 1e15);
  }

  // Methods to add and subtract byte values
  add(other: ByteConverterService): ByteConverterService {
    return ByteConverterService.fromBytes(this.bytes + other.bytes);
  }

  subtract(other: ByteConverterService): ByteConverterService {
    return ByteConverterService.fromBytes(this.bytes - other.bytes);
  }

  // Static comparison methods
  static greaterThan(left: ByteConverterService, right: ByteConverterService): boolean {
    return left.bits > right.bits;
  }

  static lessThan(left: ByteConverterService, right: ByteConverterService): boolean {
    return left.bits < right.bits;
  }

  static lessThanOrEqual(left: ByteConverterService, right: ByteConverterService): boolean {
    return left.bits <= right.bits;
  }

  static greaterThanOrEqual(left: ByteConverterService, right: ByteConverterService): boolean {
    return left.bits >= right.bits;
  }

  static compare(left: ByteConverterService, right: ByteConverterService): number {
    if (left.bits < right.bits) return -1;
    if (left.bits === right.bits) return 0;
    return 1;
  }

  // Instance comparison method
  compareTo(other: ByteConverterService): number {
    if (this.bits < other.bits) return -1;
    if (this.bits === other.bits) return 0;
    return 1;
  }

  isEqual(other: ByteConverterService): boolean {
    return this.bits === other.bits;
  }

  // Method to convert to human-readable format
  toHumanReadable(unit: SizeUnit, precision: number = 2): string {
    switch (unit) {
      case SizeUnit.TB:
        return `${this._withPrecision(this.teraBytes, precision)} TB`;
      case SizeUnit.GB:
        return `${this._withPrecision(this.gigaBytes, precision)} GB`;
      case SizeUnit.MB:
        return `${this._withPrecision(this.megaBytes, precision)} MB`;
      case SizeUnit.KB:
        return `${this._withPrecision(this.kiloBytes, precision)} KB`;
      case SizeUnit.B:
        return `${this.asBytes(precision)} B`;
      default:
        return `${this.asBytes(precision)} B`;
    }
  }
}
