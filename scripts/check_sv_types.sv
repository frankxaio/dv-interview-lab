// Codex verification: IEEE 1800 section 6.11.2 and Table 6-8.
module check_sv_types;
  int two_state_int;
  integer four_state_integer;
  byte two_state_byte;
  shortint two_state_shortint;
  longint two_state_longint;
  bit two_state_bit;
  logic four_state_logic;

  initial begin
    assert (two_state_int === 32'd0) else $fatal(1, "int default");
    assert (four_state_integer === 32'bx) else $fatal(1, "integer default");
    two_state_int = 'x;
    four_state_integer = 'x;
    two_state_byte = 'x;
    two_state_shortint = 'x;
    two_state_longint = 'x;
    two_state_bit = 'x;
    four_state_logic = 'x;
    assert (two_state_int === 32'd0) else $fatal(1, "int X conversion");
    assert (two_state_byte === 8'd0) else $fatal(1, "byte X conversion");
    assert (two_state_shortint === 16'd0) else $fatal(1, "shortint X conversion");
    assert (two_state_longint === 64'd0) else $fatal(1, "longint X conversion");
    assert (two_state_bit === 1'b0) else $fatal(1, "bit X conversion");
    assert (four_state_integer === 32'bx) else $fatal(1, "integer X retention");
    assert (four_state_logic === 1'bx) else $fatal(1, "logic X retention");
    $display("PASS: int/byte/shortint/longint/bit are two-state; integer/logic retain X");
    $finish;
  end
endmodule
