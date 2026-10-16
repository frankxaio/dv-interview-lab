card "DV answers 1-116: Digital Design & Computer Architecture" [2c483f0f-20e3-4dd6-9f79-407b7d8b37d9] 471 lines
1	# DV answers 1-116: Digital Design & Computer Architecture
2	
3	- **1. Overlapping 1101 Mealy Sequence Detector and Verification**
4	
5	  - Use four states representing matched prefixes: none, 1, 11, and 110. On input 1 in state 110, assert the Mealy output and return to state 1 so overlaps remain possible. Transitions: none→1 on 1; 1→11 on 1 else none; 11 stays on 1 else 110; 110→1 on 1 else none. Verify 1101101 gives two detections, plus reset and near misses.
6	
7	- **2. Parameterized Gray-Code Transition Checker**
8	
9	  - Compare successive valid samples: `delta = gray ^ prev_gray`. Require `$onehot(delta)` if a transition must occur, or `$onehot0(delta)` if holding is allowed. Also reject X/Z and skip the first sample after reset. This checks the number of changed bits, not whether the bus follows the intended Gray sequence; check binary progression separately if required.
10	
11	- **3. Four-Request Locked Fixed-Priority Arbiter**
12	
13	  - Assume request 0 has highest priority. When unlocked, choose the first asserted request. When locked, retain the registered owner until the specified release event, even if a higher-priority request arrives. Grant only one requester and define whether grant remains asserted when the locked owner's request drops. Verify mutual exclusion, priority, lock retention, reset, and potential starvation.
14	
15	- **4. Parameterized Synchronous FIFO RTL Implementation**
16	
17	  - Use memory, read/write pointers, and an occupancy counter of width `$clog2(DEPTH+1)`. Define accepted push and pop, then increment/decrement count only when exactly one is accepted. Explicitly wrap pointers at DEPTH-1 for arbitrary depth. Define simultaneous operations at full/empty and memory read latency. Verify ordering, boundary behavior, wraparound, and count conservation.
18	
19	- **5. Setup/Hold, Violations, Two-Flop Synchronizer, and MTBF**
20	
21	  - Setup is the required stable interval before the sampling edge; hold is after it. A violation can cause metastability. A two-flop destination-clock synchronizer lets the first stage resolve before the second samples it. MTBF grows approximately exponentially with available resolution time and falls with clock and input transition rates. It reduces failure probability; it cannot guarantee zero failures or capture every short pulse.
22	
23	- **6. Five-Stage Pipeline RAW, WAR, WAW, Forwarding, and Stalls**
24	
25	  - RAW is a true dependency on an older instruction's result. Forward EX/MEM or MEM/WB results when available; a load-use dependency commonly needs a stall because data arrives later. A conventional in-order five-stage pipeline with ordered reads and writes avoids WAR and WAW hazards. These arise when operations execute or complete out of order. Branch hazards need prediction, stalls, or flushing.
26	
27	- **7. Setup/Hold Time: Concepts, Violations, and Fixes**
28	
29	  - For capture-minus-launch skew S, setup requires `T >= tcq_max + tcomb_max + tsetup - S + uncertainty`. Hold requires `tcq_min + tcomb_min >= thold + S + hold_uncertainty`. Improve setup by shortening logic, pipelining, or increasing the period. Fix hold by adding minimum-path delay or changing skew. Lowering frequency usually does not fix hold.
30	
31	- **8. CDC: Synchronizer Placement**
32	
33	  - Place destination-clock synchronizer stages close together to maximize resolution time. Register source control signals when possible to remove combinational glitches. Do not put combinational logic between stages or use the first-stage output elsewhere. Synchronize before destination-domain fanout. Choose a pulse handshake or asynchronous FIFO when a simple single-bit level synchronizer cannot preserve the information.
34	
35	- **9. RTL Bug Fix: Synchronous FIFO**
36	
37	  - Needs the original RTL for an exact patch. Typical bugs are incorrect full/empty comparisons, pointer width or wrap errors, conflicting count assignments, and reading/writing while blocked. Compute accepted operations once, update count with a four-case push/pop decision, and use nonblocking assignments for registers. Check memory read latency and same-address read/write behavior against the intended interface.
38	
39	- **10. RTL Bug Fix: Power Manager (CDC + Blocking/Non-blocking)**
40	
41	  - Needs the power-manager RTL for a line-specific fix. Synchronize asynchronous control levels, use handshakes for commands that must not be lost, and synchronize reset release. Use nonblocking assignments in clocked state updates and blocking assignments in complete combinational next-state logic. Check isolation, retention, power-good, and clock sequencing so an off domain cannot drive unsafe values.
42	
43	- **11. Safety-Aware RTL Design: Techniques and Applications**
44	
45	  - Safety design detects faults and moves to a defined safe state. Examples include ECC/parity, duplicated computation or lockstep, watchdogs, illegal-state detection, and error reporting. Use fault injection to verify detection latency and recovery. Diagnostic coverage and independence matter; duplicating logic alone does not address common-mode faults. The required safe behavior comes from the system safety requirements.
46	
47	- **12. Security-Aware RTL Design: Techniques and Applications**
48	
49	  - Start with assets, privilege boundaries, and attacker capabilities. Enforce access control, secure reset defaults, debug restrictions, key isolation/zeroization, and validated transaction boundaries. Consider side channels, fault injection, and information leakage through error responses. Verify unauthorized accesses, privilege transitions, malformed commands, and secret handling. Security claims require a stated threat model.
50	
51	- **13. Low Power RTL Design: Common Techniques and Applications**
52	
53	  - Dynamic power is approximately `alpha*C*V^2*f`. Reduce switching with clock enables, integrated clock gating, operand isolation, and smaller or banked datapaths. Power gating reduces leakage but requires isolation, retention choices, and sequencing. DVFS reduces voltage and frequency together within timing limits. Verify functional behavior across idle, wakeup, and power transitions.
54	
55	- **14. Lockstep RISC-V: Implementation and Power Impact**
56	
57	  - Run two RISC-V cores on the same architectural inputs and compare defined outputs or commit records. Delayed lockstep can reduce some common-mode timing risks but requires input/output alignment. On mismatch, raise a safety fault and follow a specified recovery policy. Power rises because computation is duplicated plus comparison logic; clock gating during permitted idle periods can reduce the overhead.
58	
59	- **15. Low Power Techniques Overview**
60	
61	  - Clock gating reduces clock-tree and register switching; operand isolation stops unused combinational activity. Power gating reduces leakage, retention preserves selected state, and isolation clamps signals from off domains. DVFS trades performance for lower voltage/frequency. Memory banking and architectural changes can reduce accesses. Select techniques using measured activity and a clear wakeup/performance budget.
62	
63	- **16. Multi-Voltage Domain and DVFS Design Details**
64	
65	  - Use level shifters between incompatible voltage domains and isolation when a source can turn off. Retain only state needed after wakeup. For DVFS, normally raise voltage before raising frequency, and lower frequency before lowering voltage. Wait for regulator/PLL stability and quiesce transactions when required. UPF describes power intent; verify each legal state and transition.
66	
67	- **17. LRU and PLRU Cache Replacement: 16-Way Implementation**
68	
69	  - Exact LRU tracks a total recency order, with at least `ceil(log2(16!)) = 45` bits of information for 16 ways; practical encodings can use more. Tree PLRU uses 15 bits. On access, update the four nodes along the accessed path to point away from that way. Follow the bits to select a victim, preferring invalid ways first. PLRU approximates LRU.
70	
71	- **18. Parity Check: 16-bit Data Implementation and Gate Layers**
72	
73	  - Even-parity generation is `p = ^data` for 16 data bits. With the stored parity bit, an error indication is `^( {data,p} )`. A balanced tree uses 15 two-input XORs and four logical levels for generation. Parity detects any odd number of bit flips but misses even numbers and cannot identify or correct the bad bit.
74	
75	- **19. Digital Design: Build an Inverter Using Gates X and Y**
76	
77	  - Missing gate definitions. Derive X and Y truth tables first and try tying inputs together or to constants. A NAND or NOR with both inputs tied to A gives NOT A; XOR with a tied-high input also inverts. If X and Y are non-inverting monotone gates and only ordinary constants are available, inversion cannot be synthesized. The exact construction depends on the supplied gates.
78	
79	- **20. Verilog: Implement Fibonacci Sequence**
80	
81	  - Keep two registers initialized to 0 and 1. On enable, update `a <= b; b <= a+b;` and define which register is the output. Nonblocking assignments use the old operands, giving 0,1,1,2,3,5,... across updates. Specify reset and finite-width overflow behavior. Check the recurrence, enable holds, and the first few values against a software model.
82	
83	- **21. Digital Design: NOR + Two D-FFs Circuit Waveform**
84	
85	  - Missing the circuit diagram, connections, initial state, and clock edges. Write one next-state equation per flip-flop from its D input, then evaluate every register from the same pre-edge state. A NOR output is `~(a|b)`. Tabulate old Q values, D values, and new Q values for each edge. Do not assume a specific waveform from the title alone.
86	
87	- **22. Debug: Multiple CPUs Reading Inconsistent Data**
88	
89	  - Separate coherence from memory ordering. Check whether the address is cacheable, whether all CPUs observe the same physical address, and whether cache maintenance or barriers are required. Trace writes, invalidations, ownership, and loads. A coherent system may still need synchronization to order operations. Also investigate DMA coherence, stale aliases, races in software, and incorrect cache attributes.
90	
91	- **23. Computer Architecture: MOESI Protocol - Two Processors Writing Same Cache Line**
92	
93	  - Only one cache can hold writable ownership of a line at a time. A core requesting a write obtains exclusive ownership and invalidates other copies; concurrent ownership requests are serialized by the coherence mechanism. The second writer must acquire ownership after the first. MOESI maintains per-line coherence, but it does not make a software read-modify-write atomic or prevent lost updates.
94	
95	- **24. Computer Architecture: Cache Types and Write-Back Policy**
96	
97	  - Caches may be direct-mapped, set-associative, or fully associative, and separated into instruction/data caches or unified. Write-back updates the cache and marks a line dirty; dirty data reaches the next level on eviction or explicit writeback. Write-through propagates every write. Write-allocate versus no-write-allocate is a separate miss policy. Explain tradeoffs in latency, traffic, and implementation complexity.
98	
99	- **25. Analog/Digital: CMOS Inverter with PMOS and NMOS**
100	
101	  - A CMOS inverter has a PMOS pull-up to VDD and an NMOS pull-down to ground, with common gate input and drain output. Low input turns PMOS on and NMOS off; high input reverses them. During switching both may conduct, causing short-circuit current. Device sizing affects switching threshold, output rise/fall time, and noise margins.
102	
103	- **26. Analog Circuit: RC Low-Pass Filter**
104	
105	  - For a series resistor and shunt capacitor with output across C, `H(s)=1/(1+sRC)` and `fc=1/(2*pi*RC)`. DC passes; high frequencies are attenuated. At cutoff, magnitude is `1/sqrt(2)` and phase is -45 degrees. The time constant is RC. These formulas assume negligible source impedance and no significant load.
106	
107	- **27. Digital Design: 2-to-1 MUX Using Only NAND Gates**
108	
109	  - Implement `y=(a & ~s)|(b & s)` with four NAND gates: `ns=NAND(s,s)`, `u=NAND(a,ns)`, `v=NAND(b,s)`, and `y=NAND(u,v)`. The last NAND combines the complemented product terms by De Morgan's law. Test all eight combinations of a, b, and s.
110	
111	- **28. Sliding Window: Count 1s in a Parameterized Window**
112	
113	  - Use an N-bit shift register and a count of width `$clog2(N+1)`. On each accepted bit, subtract the outgoing bit and add the incoming bit: `next_count = count + new_bit - old_bit`, using widened arithmetic. Define startup as zero-padded or valid-only. Verify all zeros/ones, alternating data, enable gaps, N=1, and reset.
114	
115	- **29. Digital Design: 2s Complement Bit Width for A-B**
116	
117	  - For two signed N-bit operands, a full-range signed difference needs N+1 bits. The range is `-(2^N-1)` through `+(2^N-1)`. Sign-extend both operands before subtraction so an intermediate overflow cannot occur. For different widths, use max(widthA,widthB)+1. If the operands have narrower stated ranges, calculate their extrema to find the minimum width.
118	
119	- **30. Divide-by-3 Clock with 50% Duty Cycle**
120	
121	  - A divide-by-3 signal needs a high duration of 1.5 input periods for 50% duty cycle. Generate a one-cycle-high pulse every three positive edges and OR it with a half-cycle-delayed copy captured on negative edges. Define reset alignment and constrain both edge paths. Verify pulse widths and duty cycle. Use dedicated clocking resources where required by the target technology.
122	
123	- **31. Digital Design: FIFO Full and Empty Detection**
124	
125	  - In a synchronous FIFO, occupancy zero means empty and occupancy DEPTH means full. Alternatively, extra-wrap-bit pointers distinguish full from empty when address portions match. For a standard power-of-two asynchronous FIFO, compare local Gray pointers with synchronized remote pointers; full comparison inverts the top two remote Gray bits. Flags are local-domain and can deassert conservatively after synchronization delay.
126	
127	- **32. Digital Design: Synchronous vs Asynchronous Reset - When to Use Each**
128	
129	  - A synchronous reset acts only on a clock edge, simplifying synchronous timing but requiring an active clock. An asynchronous reset can assert immediately, including when clocks are stopped. Its deassertion must satisfy recovery/removal; use asynchronous assertion and synchronized deassertion per domain when appropriate. Consider technology libraries, reset distribution, startup, and retained state.
130	
131	- **33. Setup/Hold Timing Analysis and Checker**
132	
133	  - Apply max-delay analysis for setup and min-delay analysis for hold, including clock skew and uncertainty. STA checks actual implementation paths. Simulation timing checks use cell models and checks such as `$setuphold`; an RTL clocked assertion cannot measure analog setup/hold behavior or prove metastability absence. A procedural timestamp checker can check specified event spacing, but not replace STA.
134	
135	- **34. Digital Design: FSM for a Digital Lock with RTL and Assertions**
136	
137	  - Missing the lock code and timing policy. Model the longest matching prefix of the accepted key sequence, transition only on a valid key event, and define wrong-key, timeout, and reset behavior. Assert unlock occurs only after the complete sequence and for the specified duration. Test partial matches, repeated keys, overlaps, wrong keys, and timeout at boundary cycles.
138	
139	- **35. Computer Architecture: ROB and CFC - Out-of-Order Execute with In-Order Commit**
140	
141	  - A reorder buffer tracks instructions in program order while execution completes out of order. Commit only completed, exception-free instructions at the head, preserving precise architectural state. Squash younger work after a branch misprediction or exception. CFC is ambiguous in this title. If it means a committed register file, it stores retired state; confirm the course's definition before assigning a specific role.
142	
143	- **36. Computer Architecture: Two Kinds of RAT and What They Solve**
144	
145	  - A speculative RAT maps architectural registers to the newest allocated physical registers, removing WAR/WAW name dependencies. A retirement RAT records the committed mapping, supporting precise state and recovery. Checkpointed speculative maps can speed branch recovery. Physical-register reclamation must wait until older mappings are no longer needed. Terminology and exact recovery structures vary by implementation.
146	
147	- **37. Computer Architecture: Purpose of CFC in Tomasulo Machine**
148	
149	  - Classic Tomasulo uses reservation stations, tag-based dependency tracking, and a common data bus for result broadcast. CFC is not a universal Tomasulo term. If the source means a committed register file, its purpose is to retain committed architectural values for precise recovery; a ROB controls retirement. The exact CFC answer needs the original diagram or acronym definition.
150	
151	- **38. Computer Architecture: MOESI vs MESI - The O State and Performance**
152	
153	  - MOESI adds Owned to MESI. An Owned cache has the dirty shared copy and is responsible for supplying or eventually writing back it; other caches may hold Shared copies while memory remains stale. This can avoid an immediate memory writeback on a remote read of dirty data. Ownership and invalidation still enforce a single writer.
154	
155	- **39. Computer Architecture: MOESI State Transition Table for 4-Core CMP**
156	
157	  - For a snooping write-back model: local read miss I→S if shared, otherwise E; local write E→M and S/O→M after invalidating sharers. A remote read of M makes the holder O and requester S; a remote read of E makes both S. Remote ownership requests invalidate other copies, with dirty data supplied by M/O. Exact transient states require the chosen bus/directory specification.
158	
159	- **40. Verilog Macro Define Inside if-else**
160	
161	  - A macro is processed before simulation. A runtime `if/else` does not conditionally execute a `define`; the preprocessor sees directives independently of runtime control flow. Use `ifdef/`ifndef for preprocessing, parameters and generate-if for elaboration, and ordinary if-statements for runtime behavior. Check include order, macro scope, and duplicate definitions.
162	
163	- **41. Clock Divider Progression & Clock Gating**
164	
165	  - A toggle flip-flop divides by two; cascaded toggles divide further but create multiple clock domains. A counter can generate enables or divided clocks. Clock gating removes selected pulses without changing the remaining edge times. Use a glitch-free ICG, generated-clock constraints, and test enable support. Prefer a clock enable when the implementation and power goals permit it.
166	
167	- **42. Max Operating Frequency & Hold Violation**
168	
169	  - Maximum frequency follows the worst setup path: `fmax ≈ 1/(tcq_max+tcomb_max+tsetup-skew+uncertainty)`. Hold checks the shortest path between same-cycle edges and is mostly independent of clock period. Fix hold with inserted delay, routing, or skew correction; a slower clock usually helps setup only. Evaluate every mode and process/voltage/temperature corner.
170	
171	- **43. Dual Sequence Detector FSM (10111 & 10010)**
172	
173	  - Build states for the distinct proper prefixes of 10111 and 10010, sharing common prefixes. After each input, retain the longest suffix that is a prefix of either pattern. A Mealy output fires on the final bit; retain suffix state for overlaps. Verify both patterns, overlap combinations, near matches, and reset against a shift-register reference model.
174	
175	- **44. 4-Input 1024-bit Sorting Network with CAS**
176	
177	  - Use five compare-and-swap units in three layers: compare pairs (0,1) and (2,3), then (0,2) and (1,3), then (1,2). This sorts four keys. If each item is a 1024-bit record, compare its specified key and swap the whole record; if the entire value is the key, use 1024-bit comparisons. Define signedness and equal-key stability; pipeline layers if timing requires it.
178	
179	- **45. Saturating PE Unit a\*b+c**
180	
181	  - Compute the signed or unsigned product at full precision, extend c, then add with enough width to retain carry/sign. For signed W-bit output, clamp above `2^(W-1)-1` or below `-2^(W-1)`; otherwise return the low W bits. Specify scaling, rounding, and pipeline latency. Verify extrema, exact saturation boundaries, and mixed signs.
182	
183	- **46. Async FIFO Gray Code SDC Constraint**
184	
185	  - Gray coding assumes adjacent pointer transitions cannot arrive as several independent changes. Constrain delay/skew from source Gray registers to the first destination synchronizer stage to a suitable bound, often the faster clock period, using the target STA flow. Mark synchronizers and prevent retiming. A false-path alone removes timing analysis but does not enforce bus coherence.
186	
187	  - Reference: [AMD bus-skew constraints](https://docs.amd.com/r/2024.2-English/ug903-vivado-using-constraints/About-Bus-Skew-Constraints?contentId=kXqymQdxWW597oxcQ4ClQw)
188	
189	- **47. Sequence Detector Optimization**
190	
191	  - Represent states as matched prefixes, share identical behavior, and remove unreachable or equivalent states. Compare Moore and Mealy latency, state encoding, and output glitch requirements. One-hot can reduce decode depth while binary can reduce flip-flop count. Optimize using synthesis timing/area results, then prove equivalence and test overlaps; fewer states do not automatically mean faster hardware.
192	
193	- **48. Serial Divisibility-by-5 FSM**
194	
195	  - For MSB-first serial bits, let state r be the remainder 0..4. On each accepted bit b, set `r_next=(2*r+b)%5`; divisible means remainder zero at the specified observation point. Define whether leading zeros and the empty input count. For LSB-first input, track bit-position weight modulo 5 instead. Verify with a software modulo reference.
196	
197	- **49. Single-Port vs Dual-Port SRAM Interface**
198	
199	  - Single-port SRAM supports one access on its port per cycle. Simple dual-port often gives one write port and one read port; true dual-port can allow reads/writes on both. Specify independent clocks, latency, and collision behavior. Check same-address read/write and dual writes against the macro datasheet; they may be undefined. Port count trades area/power for throughput.
200	
201	- **50. create\_generated\_clock SDC**
202	
203	  - Declare the primary clock, then describe the generated clock at its output pin with a source pin and transformation, for example `create_generated_clock -name div2 -source [get_pins u_div/CK] -divide_by 2 [get_pins u_div/Q]`. Real pin names and master selection depend on the netlist. Use edge lists or inversion options for more complex waveforms, then inspect reported clocks and timing.
204	
205	- **51. MSI / MESI / MOESI Cache Coherence Protocols**
206	
207	  - MSI has Modified, Shared, Invalid. MESI adds Exclusive for a clean unshared line, allowing a silent E→M local write. MOESI adds Owned so dirty data can be shared without immediate memory writeback. Coherence serializes writes to each line; it is distinct from memory consistency and synchronization between different addresses.
208	
209	- **52. Booth Algorithm for Multiplication**
210	
211	  - Radix-2 Booth examines the multiplier's current bit and previous bit. Pair 01 adds the multiplicand; 10 subtracts it; 00 and 11 do nothing, followed by an arithmetic right shift. It compresses runs of ones and supports signed multiplication with proper extension. Radix-4 uses -2,-1,0,+1,+2 multiples and roughly halves partial-product count. Verify negative operands and minimum signed values.
212	
213	- **53. Two-Stage Pipeline ac + bc with Power Optimization**
214	
215	  - Use distributivity: `a*c+b*c=(a+b)*c`, subject to exact-width and signedness rules. Stage one can register the widened sum; stage two multiplies by c delayed to align. One multiplier may reduce area and switching, but its input is wider. Finite-width truncation or intermediate saturation can invalidate the rewrite. Check equivalence, latency, and actual switching/power reports.
216	
217	- **54. SRAM Configuration Power Analysis**
218	
219	  - Power depends on depth, width, ports, access rate, banking, supply, and macro design. Compare implementations using the foundry macro's characterized leakage and energy per read/write, with realistic activity. Banking can reduce switched capacitance but adds decode/mux overhead. Unused banks can sleep if supported. No numerical ranking is possible without the candidate configurations and workload.
220	
221	- **55. 4-bit x 4-bit Array Multiplier FA/HA Count**
222	
223	  - For one conventional unsigned 4x4 array, generate 16 partial products with AND gates, then reduce and add them; a common textbook layout uses 8 full adders and 4 half adders. The exact count changes with the reduction topology or signed implementation. Draw the weighted bit columns and count compressors to justify the chosen layout rather than treating the count as universal.
224	
225	- **56. Latchup Effect in CMOS**
226	
227	  - Latchup is unintended conduction through the parasitic PNPN structure formed by CMOS wells/substrate. Once triggered, it can sustain a large supply-to-ground current. Reduce risk with well/substrate contacts, guard rings, spacing, suitable processes, and limits on injected current or over/undershoot. This is a physical electrical effect, not an RTL latch.
228	
229	- **57. Tristate Buffer Circuit and Applications**
230	
231	  - A tristate buffer drives 0/1 when enabled and high impedance when disabled. It supports shared buses, especially I/O pins, if only one driver is enabled. Floating buses need a defined bias or keeper where appropriate. Internal FPGA tristates typically synthesize to muxes. Verify no overlapping enables and define behavior when every driver is off.
232	
233	- **58. 2-Stage Synchronizer: Metastability, Design, and Analysis**
234	
235	  - The first destination flop can become metastable; the second samples after a resolution interval. More stages increase MTBF but add latency. Use a recognized synchronizer structure, close placement, and only the final-stage output. It is suitable for a slowly changing single-bit level; short pulses and coherent multibit words need different protocols. Simulation cannot model the real analog failure probability.
236	
237	- **59. Gray Code Binary Conversion & CDC Use Case**
238	
239	  - Binary to Gray is `g=b^(b>>1)`. Gray to binary uses prefix XOR: MSB is unchanged and each lower binary bit is the XOR of Gray bits above and including it. Adjacent reflected-Gray values differ by one bit, making FIFO pointers safer to synchronize. Physical delay/skew constraints still matter, and sampled pointers can legitimately skip intermediate values.
240	
241	- **60. Async FIFO Data Path Handling**
242	
243	  - Store payload in a dual-port memory. The write domain writes data before publishing the advanced write pointer; the read domain observes the synchronized pointer before treating that entry as available. Synchronize Gray pointers, not every payload bit. Respect RAM read latency and ensure an entry is not overwritten before consumption. Verify data order across unrelated clocks and reset sequences.
244	
245	- **61. Async FIFO Architecture**
246	
247	  - An asynchronous FIFO uses local binary pointers for memory addresses and Gray pointers for crossing domains. Each domain synchronizes the other pointer, computes its own full/empty state, and accepts operations only when permitted. Typical reflected-Gray implementations use power-of-two depth and one extra wrap bit. Flags are conservative because remote updates take time to arrive.
248	
249	- **62. Same Frequency, Different Phase - Why CDC Still Needed**
250	
251	  - Equal nominal frequencies do not guarantee a safe sampling relationship. Independent clocks can drift in phase and violate setup/hold. Use CDC structures if their relationship is unconstrained. If both clocks have a known fixed relationship generated from a common source, constrain and time the paths as related clocks instead. Frequency equality alone does not establish that relationship.
252	
253	- **63. FIFO with Non-Power-of-2 Depth**
254	
255	  - A synchronous FIFO can explicitly wrap pointers at DEPTH-1 and use occupancy. A conventional Gray-pointer asynchronous FIFO cannot simply truncate the sequence at arbitrary depth because wrap may change several bits. Use a proven arbitrary-depth scheme or a power-of-two physical FIFO with a safely enforced lower logical capacity. Verify wrap and remote visibility carefully.
256	
257	- **64. FIFO Registered Output and Empty Flag Design**
258	
259	  - Distinguish memory occupancy from output-valid state. A registered RAM read returns data later, so reserve or pop the entry at request acceptance and assert output valid when data arrives. A first-word-fall-through interface instead prefetches the head. Define whether empty means no stored words or no externally available word. Check the last read, backpressure, and simultaneous refill.
260	
261	- **65. AXI Valid-Ready Handshake FSM**
262	
263	  - Transfer occurs only on a clock edge with VALID and READY high. A source asserts VALID independently of READY, and holds VALID and payload stable while stalled. A registered source needs an output slot that can be replaced when empty or consumed. AXI's channels handshake independently; the write address and data need not arrive together.
264	
265	  - Reference: [Arm AXI protocol specification](https://documentation-service.arm.com/static/63ff0ebd56ea36189d4e7ee7)
266	
267	- **66. Flip-Flop vs Latch**
268	
269	  - A flip-flop samples at an edge. A latch is transparent while its enable level is active and holds afterward. Latches can allow time borrowing but require careful phase/hold analysis. In RTL, use `always_ff` for registers and `always_latch` for intentional latches. An incomplete combinational assignment can infer an unintended latch.
270	
271	- **67. Avoiding Unintended Latches in RTL**
272	
273	  - Assign every combinational output on every path. Set defaults at the top of `always_comb`, then override in if/case branches; include appropriate default cases. Use blocking assignments in combinational logic. A register retaining its value in a clocked block is intentional state and is not a latch. Inspect synthesis warnings and lint for incomplete assignments.
274	
275	- **68. Pipeline Waveform - always @(posedge clk) A=en?1:C; B=A; C=B;**
276	
277	  - With blocking assignments in the single shown process, A gets `en?1:old_C`, then B gets new A, and C gets new B. All three end with the same value on that edge; it is not a three-stage pipeline. With nonblocking assignments, B gets old A and C gets old B. The exact waveform still needs initial values and en over time.
278	
279	- **69. CDC Multi-bit Transfer - Why Not 2-FF Synchronizer?**
280	
281	  - Independent bit synchronizers can deliver bits from different source updates, producing an incoherent word. For stable bundled data, synchronize a request and hold data until acknowledgement. Use an asynchronous FIFO for streams or Gray coding for suitable counters. Synchronizing bits independently is only acceptable when those bits are genuinely independent controls and reconvergence is safe.
282	
283	- **70. 128-bit Priority Arbiter with Logic Depth Analysis**
284	
285	  - For lowest-index priority, derive each grant from its request and absence of all higher-priority requests. A naive serial prefix chain has O(N) depth; a balanced prefix/tree encoder gives approximately O(log2 N), or seven combining levels for 128 inputs, plus output decode. Area and exact delay depend on fanout, cell mapping, and output encoding. Fixed priority can starve low-priority requests.
286	
287	- **71. Cache - CPU Write, Set Mapping, PLRU**
288	
289	  - A cache address splits into byte offset, set index, and tag. A write hit changes the data and marks dirty for write-back; a write miss follows the allocation policy. For tree PLRU, update bits along the accessed way's path and use them to select a victim, with invalid ways preferred. Exact index bits require capacity, line size, associativity, and address width.
290	
291	- **72. Packet Stream Interface Signals**
292	
293	  - A streaming interface commonly has data, valid, ready, start/end-of-packet, byte-valid/keep, and optional ID/destination/error metadata. Define which side drives each signal and what remains stable under backpressure. A beat transfers on valid&&ready. Specify partial last beats, empty packets, interleaving, reset, and error behavior. The title does not identify one particular protocol.
294	
295	- **73. Implement AND Gate Using 2-to-1 MUX**
296	
297	  - For `y=a&b`, use select a, input 0 tied to 0, and input 1 connected to b: `y = a ? b : 1'b0`. Either operand may be the select. Verify the four input combinations.
298	
299	- **74. Race Condition in Verilog initial Blocks**
300	
301	  - Separate initial blocks run concurrently in the active region; their ordering is unspecified. If one writes a variable and another reads it at the same time, the result can be race-dependent. Put ordered operations in one process, use an event/handshake, or sample in a suitable clocking region. A #0 delay is not a robust general race fix.
302	
303	- **75. Polymorphism and Inheritance in SystemVerilog/UVM**
304	
305	  - Inheritance derives a specialized class from a base class. A base handle can reference a derived object; a virtual method call dispatches to the object's runtime type. UVM uses this for configurable drivers, sequences, and factory overrides. Nonvirtual methods use static dispatch. Use `$cast` when recovering a derived handle, and check success before accessing derived members.
306	
307	- **76. Timescale Directive - 1ns/1ps**
308	
309	  - `timescale 1ns/1ps` means delays use nanoseconds and are rounded to picosecond precision. For example #1.25 is 1.25 ns. Prefer explicit `timeunit 1ns; timeprecision 1ps;` within design units to avoid file-order dependence. Precision affects rounding and simulation cost; it does not change a declared clock frequency automatically.
310	
311	- **77. D Flip-Flop RTL with Power Supply Check**
312	
313	  - For a behavioral power model, sample D on the active clock edge only when supply is valid; otherwise assign the specified unknown, clamp, or retained behavior. Ordinary synthesizable RTL does not implement physical supply checking. A power-aware flow uses UPF and library power models for corruption, isolation, and retention. The desired power-off behavior must be specified.
314	
315	- **78. Clock Gating - Basic and ICG with Negative Latch**
316	
317	  - Directly ANDing clk with an asynchronous enable can create short pulses. An ICG holds enable stable during the clock-high interval, often using a low-level latch, then ANDs the held enable with clk. Test enable is typically included. Check glitch-free operation, scan use, and enable timing. Use the target library's approved gating cell and STA checks.
318	
319	- **79. Voting Machine - 3 Judges + Super Judge Veto**
320	
321	  - If a proposal passes with at least two of three judges unless the super judge vetoes, `pass=(a&b | a&c | b&c) & ~veto`. If the super judge also has a vote or override approval, the equation changes. Confirm that policy first, then verify all input combinations and any registered timing requirements.
322	
323	- **80. NAND Gate - CMOS, Stick Diagram, EM**
324	
325	  - A CMOS NAND2 has series NMOS devices to pull down only when both inputs are high, and parallel PMOS devices to pull up when either input is low. A stick diagram shows topology and layer connectivity, not final dimensions. EM checks depend on current density, duty cycle, temperature, and physical wiring. Exact layout/EM conclusions need dimensions and current data.
326	
327	- **81. CMOS DFF (Master-Slave Latch) with Tri-State Buffer**
328	
329	  - A master-slave DFF combines two opposite-phase latches. In a positive-edge version, the master is transparent low and the slave high. Tristate inverters/buffers can switch between input sampling and feedback retention. Verify nonoverlap, setup/hold, and feedback stability. A gate-level transistor implementation needs the supplied circuit; behavioral RTL alone does not establish transistor timing.
330	
331	- **82. What Does This Circuit Do?**
332	
333	  - Missing circuit. Identify inputs, outputs, storage elements, and feedback, derive Boolean and next-state equations, then enumerate states or simulate representative stimuli. State the observed function only after checking reset and timing behavior. The question title cannot determine whether it is a divider, latch, detector, or another function.
334	
335	- **83. Sequence Detector FSM (1011 Pattern)**
336	
337	  - For overlapping 1011, use matched-prefix states none, 1, 10, 101. Complete on input 1 in state 101, then retain state 1. From 101 on 0 go to 10; from 1 on 1 stay at 1; from 10 on 0 return to none. A Moore implementation needs an output state and adjusted overlap transitions.
338	
339	- **84. Minimum FIFO Depth Calculation**
340	
341	  - Calculate worst-case backlog as cumulative accepted writes minus cumulative reads over all time, including startup latency, bursts, stalls, clock phase, and flag synchronization delays. Required depth is the maximum backlog plus any specified margin. If long-term write rate exceeds read rate without backpressure, no finite FIFO prevents overflow. Average rates alone are insufficient.
342	
343	- **85. Blocking vs NBA Pipeline - A=in, B=A, C=B**
344	
345	  - Blocking `A=in; B=A; C=B;` in one clocked process propagates the current input to all three immediately within that process. Nonblocking `A<=in; B<=A; C<=B;` samples old RHS values and creates three register stages. Count latency using explicitly numbered sampling edges. Other processes reading blocking-updated values on the same edge can race.
346	
347	- **86. Error Window FSM with 64-Cycle Counter**
348	
349	  - Define what opens the window, whether the trigger cycle counts, and what retriggers do. For exactly 64 eligible cycles, use a counter with states 0..63 and close after processing cycle 63. Capture/report errors only during the active window. Assert duration, trigger behavior, and reset cancellation. Test the first/last eligible cycle and one cycle outside each boundary.
350	
351	- **87. C++ Bit Manipulation - Set/Clear Nth Bit**
352	
353	  - Use an unsigned type and validate `0 <= n < bit_width`. Set with `x |= U(1)<<n`; clear with `x &= ~(U(1)<<n)`, where U is the operand's unsigned type. Avoid signed shifts into the sign bit and shifts by the width or more. For uint64\_t, use a 64-bit constant rather than plain int 1.
354	
355	- **88. Vending Machine FSM - Requirements and State Design**
356	
357	  - First define price, allowed coins, change behavior, cancel, stock, and payment/dispense timing. States can represent accumulated credit or operational phases with a credit register. Dispense only after enough credit and available stock, and define overpayment. Verify exact/under/overpayment, invalid coins, cancel, simultaneous events, and reset during a transaction.
358	
359	- **89. Clock Module with Randomized Initial State**
360	
361	  - A randomized clock phase belongs in the testbench, not ordinary functional RTL. Randomize a bounded initial delay and legal period/duty cycle, then toggle with positive delays and sufficient timeprecision. Reproduce using a recorded seed. If randomizing a module's initial register state, define how reset establishes a known legal state and check startup separately.
362	
363	- **90. What is an Interrupt?**
364	
365	  - An interrupt requests processor attention to an event. The CPU recognizes it when permitted, saves required state, selects a handler, and resumes afterward. Distinguish level/edge triggering, masking, pending state, priority, and acknowledgement. Verify events while masked, simultaneous sources, clear/set races, and CDC. A level source may reassert until its cause is cleared.
366	
367	- **91. Verilog Simulation Scheduling - initial Block Race**
368	
369	  - Two initial blocks at the same time have no defined active-region order. Track active events, inactive #0 events, nonblocking updates, and postponed printing separately. Use nonblocking assignments or explicit synchronization where appropriate. To give a specific output trace, the actual code and delays are needed; simulator-dependent ordering is not a portable answer.
370	
371	- **92. Hardware Optimization - Loop Unrolling, Pipelining, Tiling, Array Partitioning**
372	
373	  - Unrolling creates parallel hardware and increases area/bandwidth demand. Pipelining inserts registers to improve throughput and timing but adds latency. Tiling reuses local data to reduce memory traffic. Array partitioning creates banks or registers for more simultaneous accesses. Choose based on dependency structure, memory ports, and resource limits; verify numerical equivalence and interface timing after changes.
374	
375	- **93. IEEE 754 Floating Point - Format, Operations, Edge Cases**
376	
377	  - Binary32 has one sign bit, eight exponent bits, and 23 fraction bits. Normal values use an implicit leading 1; exponent-zero encodes zeros/subnormals and all-ones encodes infinities/NaNs. Operations align or multiply significands, normalize, round, and handle exceptions. Verify signed zero, subnormal boundaries, overflow, underflow, NaNs, infinities, and every supported rounding mode.
378	
379	- **94. SRAM RTL Implementation and Why No Reset**
380	
381	  - Model SRAM as an array with specified synchronous read/write behavior. Memory cells usually have no whole-array reset; clearing every location can prevent SRAM inference and require large reset logic. Reset control/output-valid state instead, then initialize memory through writes if needed. Verify read latency, write masking, address range, uninitialized reads, and read-during-write semantics.
382	
383	- **95. Synchronous FIFO Using SRAM with Counter**
384	
385	  - Use SRAM for payload and pointers/count for control. Gate push/pop with acceptance rules and explicitly wrap addresses. Align read responses with SRAM latency using a valid pipeline or output buffer. Update occupancy based on accepted operations, not raw requests. Check same-address simultaneous access against macro behavior and cover full/empty transitions and backpressure.
386	
387	- **96. Sequential vs Combinational Logic**
388	
389	  - Combinational outputs depend on current inputs and contain no intended stored state. Sequential outputs depend on prior state plus inputs and update through flip-flops or latches. Describe combinational logic with complete assignments and sequential logic with explicit clocks/enables/reset. Propagation delay exists in both; storage is the distinguishing property.
390	
391	- **97. UPF - Unified Power Format, Flow, and X Propagation**
392	
393	  - UPF describes supply networks, power domains, switches, power states, isolation, retention, and level shifting. Tools combine this intent with RTL and libraries for implementation and power-aware simulation. Off-domain state can become X; isolation and restore sequences prevent unsafe propagation. Verify legal transitions and expected corruption rather than globally suppressing X values.
394	
395	- **98. 4-bit Counter with Hold at 3, 6, 9**
396	
397	  - A counter that always holds at 3 can never naturally reach 6 or 9. Clarify whether it holds while an external signal is active or pauses for one cycle. For one-cycle pauses, add a pause flag so the next cycle advances. For external hold, update only when hold is absent. Check reachability, overflow, reset, and all pause points.
398	
399	- **99. Jump Immediate vs Jump Register (ISA)**
400	
401	  - A jump-immediate target comes from an instruction-encoded displacement or address, often PC-relative. A jump-register target comes from a register, possibly plus an immediate, supporting indirect calls and returns. Encoding, alignment, and link-register behavior depend on the ISA. Verify sign extension, target alignment, and control-flow flushing; do not assume one ISA's formula applies universally.
402	
403	- **100. Clock Mux Glitch - sel ? clk1 : clk2 and Fix**
404	
405	  - A combinational clock mux can create extra edges or runt pulses when sel changes while clocks differ. Use a dedicated glitch-free clock mux or a proven mutually exclusive gating scheme that changes enables during safe clock phases. Handle stopped clocks and asynchronous switching explicitly. Define switching latency and constrain each clock mode in STA.
406	
407	- **101. Implement NAND Gate Using 2-to-1 MUX**
408	
409	  - For `y=~(a&b)`, select a, connect input 0 to 1 and input 1 to \~b. A MUX plus an inverter works. If only MUXes and constants are allowed, form \~b with a first MUX whose select is b and inputs are 1 and 0. A single ordinary MUX with only a, b, and constants cannot directly supply \~b.
410	
411	- **102. Pipeline Hazards and Cache Mapping**
412	
413	  - Data hazards involve dependencies; structural hazards involve competing resources; control hazards involve branches. Forward, stall, arbitrate, or flush according to the cause. Cache mapping divides the address into offset, set, and tag according to geometry. These are separate mechanisms that interact through memory latency and misses. A numerical mapping or cycle trace needs the actual cache/pipeline parameters.
414	
415	- **103. APB FIFO Design - RTL Implementation**
416	
417	  - Accept APB accesses only at `PSEL && PENABLE && PREADY`. Decode write-to-push and read-to-pop addresses, report or stall disallowed operations according to the specification, and return stable PRDATA during the completed access. Account for FIFO/SRAM latency. Verify wait states, back-to-back transfers, full/empty handling, byte strobes where supported, and reset.
418	
419	- **104. Race Condition in Verilog - Blocking Assignment in always Block**
420	
421	  - A clocked blocking assignment can update a register before another same-edge process samples it, creating a race. Use nonblocking updates for shared sequential state and suitable clocking blocks for testbench drive/sample separation. Blocking assignments remain useful for local temporary calculations inside one process. Reproduce the failure with the actual code and inspect scheduling before changing it.
422	
423	- **105. Verilog/SV Scheduling Regions - Complete Model**
424	
425	  - The major time-slot regions proceed through Preponed sampling; Active, Inactive, NBA design activity; Observed assertion evaluation; Reactive, Re-Inactive, Re-NBA program activity; and Postponed reporting. Additional PLI callback regions exist between these, and same-slot activity can iterate. #0 moves a module process to Inactive, not past NBA. Concurrent assertions normally sample in Preponed and evaluate in Observed.
426	
427	- **106. Async FIFO from Scratch - Gray Code Pointer Design**
428	
429	  - For depth `2^A`, keep A+1-bit binary pointers. Increment only on accepted transfers, compute `gray=(binary>>1)^binary`, and synchronize Gray pointers through destination flops. Compute registered empty from next read Gray equality; full from next write Gray equality with the remote Gray top two bits inverted. Handle small parameter widths explicitly and verify resets, wrap, and independent clocks.
430	
431	- **107. NAND2 Schematic - Why NMOS Series, PMOS Parallel**
432	
433	  - NAND output must be low only for A=B=1, so the NMOS pull-down needs both devices on in series. Output must be high if either input is zero, so PMOS pull-ups are in parallel. Device sizing compensates for series resistance. Transistor networks implement complementary pull-up/pull-down truth conditions.
434	
435	- **108. Data Activity Monitor - RTL and Verification**
436	
437	  - Clarify whether activity means any transition, accepted transfers, or a count over a time window. For transition activity, compare the current sampled data with the previous valid sample using XOR; increment a widened counter if nonzero. For per-bit activity, accumulate popcount. Verify enable gaps, reset, counter overflow, unchanged values, and the first sample.
438	
439	- **109. 4-Input Comparator from 2-Input Comparators**
440	
441	  - For a maximum/minimum of four inputs, compare pairs in parallel, then compare their winners: three two-input comparators over two levels. Retain index metadata if the winning input must be identified, and define ties. Sorting all four inputs is a different problem and requires additional compare-and-swap operations.
442	
443	- **110. req Rising Edge -> One-Cycle flag Pulse**
444	
445	  - Register the previous req and assign `flag <= req & ~req_d; req_d <= req;` on each edge, with both reset low. Flag is a one-cycle registered indication of a sampled rising edge. Synchronize req first if asynchronous. A pulse shorter than the sampling interval may be missed and needs a pulse-capture protocol.
446	
447	- **111. 1-bit D Flip-Flop and D Latch - Verilog RTL**
448	
449	  - DFF: `always_ff @(posedge clk) if (!rst_n) q<=0; else q<=d;` describes a synchronous active-low reset. Latch: `always_latch if (!rst_n) q<=0; else if (en) q<=d;`. The latch holds when en is low. Add reset to sensitivity only if asynchronous reset is intended, and choose reset polarity/behavior from requirements.
450	
451	- **112. 4-to-1 Multiplexer - Verilog RTL (Multiple Styles)**
452	
453	  - Use `assign y = data[sel];` for a packed four-element input, a complete `case(sel)` in `always_comb`, or nested 2:1 muxes. Each implements the same 4:1 Boolean selection if widths and unknown-selection semantics agree. Verify all selector values and decide how X/Z should be handled. Avoid incomplete case assignments.
454	
455	- **113. Cache Address Structure - 32KB 4-Way 32B Cacheline**
456	
457	  - 32KB / (4 ways \* 32B) = 256 sets. A 32-byte line needs five offset bits, and 256 sets need eight index bits. For a W-bit byte address, tag width is W-13. For 32-bit addresses, offset=\[4:0], index=\[12:5], tag=\[31:13]. State whether the design uses physical or virtual indexing/tagging.
458	
459	- **114. AXI 4KB Boundary Restriction - Why and How**
460	
461	  - AXI bursts must remain within one 4KB region. For an aligned INCR burst, verify `addr[11:0] + (len+1)*(1<<size) <= 4096` with widened arithmetic. For an unaligned start, calculate the last actual byte using the beat-aligned base rather than blindly adding the entire span to addr. Validate FIXED/WRAP separately. Split requests at boundaries.
462	
463	  - Reference: [Arm AXI protocol specification](https://documentation-service.arm.com/static/63ff0ebd56ea36189d4e7ee7)
464	
465	- **115. Carry-Select Adder: Design and Timing Analysis**
466	
467	  - A carry-select adder computes each upper block twice, assuming carry-in 0 and 1, then selects using the real carry. The low block computes the first carry normally. This trades extra area/power for a shorter carry path. Select block sizes from actual gate delays; uniform blocks are not always optimal. Verify addition and carry-out across block boundaries.
468	
469	- **116. 1-bit D Flip-Flop Without always Block - Verilog RTL**
470	
471	  - An edge-triggered flip-flop cannot be described by a simple combinational assign. Instantiate a flip-flop cell or build a structural master-slave latch circuit with feedback and appropriate primitives. Synthesis support and timing depend on the technology. A latch-like feedback expression is not automatically a valid DFF. The exact permitted implementation depends on whether primitives or library cells are allowed.
