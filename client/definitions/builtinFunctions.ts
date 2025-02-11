export const builtInSignatures = {
  "format": {
    signature: "format(string format_str, type... args)",
    documentation: "Formats a string according to the specified format and arguments. Available on solve platform only.",
    parameters: [
      { label: "format_str", documentation: "The format string." },
      { label: "args", documentation: "Additional arguments to format." }
    ]
  },
  "print": {
    signature: "print(string format_str, type... args)",
    documentation: "Prints a formatted string. Available on solve platform only.",
    parameters: [
      { label: "format_str", documentation: "The format string." },
      { label: "args", documentation: "Additional arguments to format." }
    ]
  },
  "message": {
    signature: "message(message_verbosity_e vrb_level, string format_str, type... args)",
    documentation: "Outputs a message to the target platform with specified verbosity.",
    parameters: [
      { label: "vrb_level", documentation: "Verbosity level of the message. - NONE, LOW, MEDIUM, HIGH, FULL" },
      { label: "format_str", documentation: "The message format string." },
      { label: "args", documentation: "Additional arguments for message format." }
    ]
  },
  "file_open": {
    signature: "file_open(string filename, file_option_e opt)",
    documentation: "Opens a file with specified options. Available on solve platform only.",
    parameters: [
      { label: "filename", documentation: "The name of the file." },
      { label: "opt", documentation: "File open option (TRUNCATE, APPEND, READ)." }
    ]
  },
  "file_close": {
    signature: "file_close(file_handle_t file_handle)",
    documentation: "Closes an open file handle.",
    parameters: [
      { label: "file_handle", documentation: "The handle of the file to close." }
    ]
  },
  "file_exists": {
    signature: "file_exists(string filename)",
    documentation: "Checks if a file exists at the given path.",
    parameters: [
      { label: "filename", documentation: "The name of the file to check." }
    ]
  },
  "file_write": {
    signature: "file_write(file_handle_t file_handle, string format_str, type... args)",
    documentation: "Writes formatted data to an open file.",
    parameters: [
      { label: "file_handle", documentation: "The file handle." },
      { label: "format_str", documentation: "The format string for the data." },
      { label: "args", documentation: "Additional data arguments for format." }
    ]
  },
  "file_read": {
    signature: "file_read(file_handle_t file_handle, int size = -1)",
    documentation: "Reads data from a file, optionally up to a specified size.",
    parameters: [
      { label: "file_handle", documentation: "The file handle." },
      { label: "size", documentation: "The number of bytes to read (-1 for all)." }
    ]
  },
  "file_write_lines": {
    signature: "file_write_lines(string filename, list<string> lines, file_option_e opt)",
    documentation: "Writes multiple lines to a file, using specified file open options.",
    parameters: [
      { label: "filename", documentation: "The file name." },
      { label: "lines", documentation: "List of lines to write." },
      { label: "opt", documentation: "File open option (TRUNCATE, APPEND)." }
    ]
  },
  "file_read_lines": {
    signature: "file_read_lines(string filename)",
    documentation: "Reads lines from a file and returns them as a list of strings.",
    parameters: [
      { label: "filename", documentation: "The file name to read." }
    ]
  },
  "error": {
    signature: "error(string format_str, type... args)",
    documentation: "Outputs an error message with formatted arguments.",
    parameters: [
      { label: "format_str", documentation: "The error format string." },
      { label: "args", documentation: "Additional arguments for the format." }
    ]
  },
  "fatal": {
    signature: "fatal(int status, string format_str, type... args)",
    documentation: "Outputs a fatal error message with formatted arguments and terminates the program.",
    parameters: [
      { label: "status", documentation: "Exit status code." },
      { label: "format_str", documentation: "The fatal error format string." },
      { label: "args", documentation: "Additional arguments for the format." }
    ]
  },
  "urandom": {
    signature: "urandom()",
    documentation: "Generates a 32-bit unsigned random number.",
    parameters: []
  },
  "urandom_range": {
    signature: "urandom_range(bit[32] min, bit[32] max)",
    documentation: "Generates a 32-bit random number within the specified range.",
    parameters: [
      { label: "min", documentation: "Minimum value of the range." },
      { label: "max", documentation: "Maximum value of the range." }
    ]
  },
  "float_mantissa": {
    signature: "float_mantissa(float64 fv)",
    documentation: "Extracts the mantissa from a floating-point number.",
    parameters: [
      { label: "fv", documentation: "The floating-point value." }
    ]
  },
  "float_exponent": {
    signature: "float_exponent(float64 fv)",
    documentation: "Extracts the exponent from a floating-point number.",
    parameters: [
      { label: "fv", documentation: "The floating-point value." }
    ]
  },
  "float_sign": {
    signature: "float_sign(float64 fv)",
    documentation: "Extracts the sign bit from a floating-point number.",
    parameters: [
      { label: "fv", documentation: "The floating-point value." }
    ]
  },
  "to_float": {
    signature: "to_float(bit[52] mantissa, bit[11] exp, bit sign)",
    documentation: "Creates a floating-point number from mantissa, exponent, and sign.",
    parameters: [
      { label: "mantissa", documentation: "Mantissa bits." },
      { label: "exp", documentation: "Exponent bits." },
      { label: "sign", documentation: "Sign bit." }
    ]
  },
  "make_handle_from_claim": {
    signature: "make_handle_from_claim(addr_claim_base_s claim, bit[64] offset = 0)",
    documentation: "Creates an address handle from an address claim with optional offset.",
    parameters: [
      { label: "claim", documentation: "Address claim to convert to a handle." },
      { label: "offset", documentation: "Optional offset for the address." }
    ]
  },
  "make_handle_from_handle": {
    signature: "make_handle_from_handle(addr_handle_t handle, bit[64] offset)",
    documentation: "Creates a new handle from an existing handle with specified offset.",
    parameters: [
      { label: "handle", documentation: "Existing address handle." },
      { label: "offset", documentation: "Offset for the new handle." }
    ]
  },
  "addr_value": {
    signature: "addr_value(addr_handle_t hndl)",
    documentation: "Returns the 64-bit address value for a given address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "addr_value_solve": {
    signature: "addr_value_solve(addr_handle_t hndl)",
    documentation: "Solves the address value for an address handle in solve-only functions.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "get_tag": {
    signature: "get_tag(addr_handle_t hndl)",
    documentation: "Retrieves the tag associated with a given address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "read8": {
    signature: "read8(addr_handle_t hndl)",
    documentation: "Reads an 8-bit value from the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "write8": {
    signature: "write8(addr_handle_t hndl, bit[8] data)",
    documentation: "Writes an 8-bit value to the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "data", documentation: "The 8-bit data to write." }
    ]
  },
  "get_offset_of_instance": {
    signature: "get_offset_of_instance(string name)",
    documentation: "Gets the offset of a named instance in a register group.",
    parameters: [
      { label: "name", documentation: "Name of the instance." }
    ]
  },
  "log": {
    signature: "log(float64 x)",
    documentation: "Computes the natural logarithm of a floating-point number.",
    parameters: [
      { label: "x", documentation: "The input value." }
    ]
  },
  "pow": {
    signature: "pow(float64 x, float64 y)",
    documentation: "Raises x to the power y.",
    parameters: [
      { label: "x", documentation: "The base value." },
      { label: "y", documentation: "The exponent." }
    ]
  },
  "addr_value_abs": {
    signature: "solve function bool addr_value_abs(addr_handle_t hndl)",
    documentation: "Returns the absolute address value for an address handle in solve-only functions.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "read16": {
    signature: "target function bit[16] read16(addr_handle_t hndl)",
    documentation: "Reads a 16-bit value from the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "read32": {
    signature: "target function bit[32] read32(addr_handle_t hndl)",
    documentation: "Reads a 32-bit value from the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "read64": {
    signature: "target function bit[64] read64(addr_handle_t hndl)",
    documentation: "Reads a 64-bit value from the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." }
    ]
  },
  "write16": {
    signature: "target function void write16(addr_handle_t hndl, bit[16] data)",
    documentation: "Writes a 16-bit value to the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "data", documentation: "The 16-bit data to write." }
    ]
  },
  "write32": {
    signature: "target function void write32(addr_handle_t hndl, bit[32] data)",
    documentation: "Writes a 32-bit value to the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "data", documentation: "The 32-bit data to write." }
    ]
  },
  "write64": {
    signature: "target function void write64(addr_handle_t hndl, bit[64] data)",
    documentation: "Writes a 64-bit value to the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "data", documentation: "The 64-bit data to write." }
    ]
  },
  "read_bytes": {
    signature: "target function void read_bytes(addr_handle_t hndl, list<bit[8]> data, int size)",
    documentation: "Reads multiple bytes from the specified address handle into a list.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "data", documentation: "The list to store the read bytes." },
      { label: "size", documentation: "The number of bytes to read." }
    ]
  },
  "write_bytes": {
    signature: "target function void write_bytes(addr_handle_t hndl, list<bit[8]> data)",
    documentation: "Writes multiple bytes to the specified address handle from a list.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "data", documentation: "The list of bytes to write." }
    ]
  },
  "read_struct": {
    signature: "target function void read_struct(addr_handle_t hndl, struct packed_struct)",
    documentation: "Reads a packed structure from the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "packed_struct", documentation: "The structure to read into." }
    ]
  },
  "write_struct": {
    signature: "target function void write_struct(addr_handle_t hndl, struct packed_struct)",
    documentation: "Writes a packed structure to the specified address handle.",
    parameters: [
      { label: "hndl", documentation: "The address handle." },
      { label: "packed_struct", documentation: "The structure to write." }
    ]
  },
  "read": {
    signature: "target function R read()",
    documentation: "Reads the value from a specified register R.",
    parameters: []
  },
  "write": {
    signature: "target function void write(R r)",
    documentation: "Writes a value to a specified register R.",
    parameters: [
      { label: "r", documentation: "The register value to write." }
    ]
  },
  "read_val": {
    signature: "target function bit[SZ] read_val()",
    documentation: "Reads a value of size SZ bits from a register.",
    parameters: []
  },
  "write_val": {
    signature: "target function void write_val(bit[SZ] r)",
    documentation: "Writes a value of size SZ bits to a register.",
    parameters: [
      { label: "r", documentation: "The bit value of size SZ to write." }
    ]
  },
  "write_masked": {
    signature: "target function void write_masked(R mask, R val)",
    documentation: "Writes a masked value to a register using a register mask.",
    parameters: [
      { label: "mask", documentation: "The register mask to apply." },
      { label: "val", documentation: "The register value to write." }
    ]
  },
  "write_val_masked": {
    signature: "target function void write_val_masked(bit[SZ] mask, bit[SZ] val)",
    documentation: "Writes a masked value to a register using a bit mask of size SZ.",
    parameters: [
      { label: "mask", documentation: "The bit mask of size SZ to apply." },
      { label: "val", documentation: "The bit value of size SZ to write." }
    ]
  },
  "write_field": {
    signature: "target function void write_field(string name, bit[SZ] val)",
    documentation: "Writes a value to a specific field within a register by name.",
    parameters: [
      { label: "name", documentation: "The name of the field within the register." },
      { label: "val", documentation: "The bit value of size SZ to write." }
    ]
  },
  "write_fields": {
    signature: "target function void write_fields(list<string> names, list<bit[SZ]> vals)",
    documentation: "Writes values to multiple fields within a register by names.",
    parameters: [
      { label: "names", documentation: "A list of field names within the register." },
      { label: "vals", documentation: "A list of bit values of size SZ to write to each field." }
    ]
  },
  "get_offset_of_instance_array": {
    signature: "pure function bit[64] get_offset_of_instance_array(string name, int index)",
    documentation: "Retrieves the 64-bit offset of an instance in an array by its name and index within a register group.",
    parameters: [
      { label: "name", documentation: "The name of the instance array." },
      { label: "index", documentation: "The index of the instance within the array." }
    ]
  },
  "get_offset_of_path": {
    signature: "pure function bit[64] get_offset_of_path(list<node_s> path)",
    documentation: "Retrieves the 64-bit offset along a specified path within a register group.",
    parameters: [
      { label: "path", documentation: "A list of `node_s` objects defining the path to the offset." }
    ]
  },
  "set_handle": {
    signature: "solve function void set_handle(addr_handle_t addr)",
    documentation: "Sets the address handle for a register group.",
    parameters: [
      { label: "addr", documentation: "The address handle to associate with the register group." }
    ]
  }
};
