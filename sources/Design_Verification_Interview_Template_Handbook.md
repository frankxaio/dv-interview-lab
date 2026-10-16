card "Design Verification Interview Template Handbook" [041c0df1-e615-48da-b29a-0e1f3d18a942] 2532 lines
1	# Design Verification Interview Template Handbook
2	
3	This handbook turns the <hepta-mention type="card" id="afd37ea3-db52-4472-8b37-ae7ed449ba92">TongXinTongXing DV Interview Question Bank</hepta-mention> into 36 reusable answer templates. Each template gives the situation it fits, the invariant to state out loud, a code or method skeleton, the adaptations interviewers ask for, and the traps they probe. Every template ends with the bank questions it prepares you for.
4	
5	A question number such as Q251 is the entry's position in the bank, counted from the top across all sections. The Supplement entry is Q361.
6	
7	**Reading map**
8	
9	| Templates | Topic |
10	| --- | --- |
11	| 01-04 | UVM driver architectures, multiple outstanding transactions, AXI rules |
12	| 05-13 | One connected APB example: contract, interface, item, driver, sequences, monitor, scoreboards, environment, test |
13	| 14-16 | Register models, verification planning, debug |
14	| 17-23 | Constraints, assertions, time measurement, fork/join, OOP |
15	| 24-31 | FSMs, FIFOs, CDC, timing, RTL coding, datapaths, gate puzzles, low power |
16	| 32-36 | Algorithms, bit tricks, caches and pipelines, circuits, behavioral and puzzles |
17	
18	**Study order.** For UVM, read 05, 06, 07, 08, 09, 10, 11, 13 in that order, then 03, 04 and 12 for decoupled drivers and out-of-order checking. For a question you already have, search this card for its Q-number.
19	
20	**Code status.** The code is interview material and has not been compiled. Before you quote a snippet as tested, compile it and run the validation list in Template 13.
21	
22	---
23	
24	## How to answer any template question
25	
26	1. **Clarify the contract.** Ask about inputs, outputs, legal timing, ordering, reset behavior, and what "done" means.
27	
28	2. **State the invariant.** Say the property the hardware or protocol must keep before you write code.
29	
30	3. **Pick state and data structures** that make the invariant easy to maintain.
31	
32	4. **Write the normal path first.** Handle valid, unstalled transfers only.
33	
34	5. **Add edge cases.** Backpressure, simultaneous events, reset, timeouts, errors.
35	
36	6. **Walk two traces.** One normal trace and one adversarial trace, out loud.
37	
38	Memorize invariants and adaptation points. Interviewers change the problem slightly to see whether you memorized code.
39	
40	---
41	
42	## 01. Driver architecture and API contracts
43	
44	Use this when you must choose how a driver hands items back to the sequence. The invariant is that sequence acceptance, physical bus completion, and response routing are three separate obligations. Templates 02 to 04 implement the three choices.
45	
46	**Interview answer.** "I first decide whether the sequence must wait for bus completion. If yes, I use a serialized driver. If not, I decouple acceptance from execution with an owned queue. If the protocol has independent channels or multiple outstanding transactions, I run one worker thread per channel and track outstanding work by ID."
47	
48	The three choices:
49	
50	- **Serialized completion.** One transaction finishes on the interface before the next starts (Template 02).
51	
52	- **Decoupled request and response.** The sequence is released early while the driver finishes the transfer (Template 03).
53	
54	- **Independent channels.** Separate threads drive concurrent channels such as AXI AW and W, with several transactions in flight (Template 04).
55	
56	**Rules to quote.**
57	
58	- `get_next_item()` needs exactly one `item_done()`.
59	
60	- `get()` finishes the sequencer handshake itself. Never call `item_done()` after it.
61	
62	- Calling `item_done()` early releases the sequence. It does not pipeline the bus. Pipelining needs independent protocol threads.
63	
64	- Copy routing IDs into every response with `rsp.set_id_info(req)`, or the response goes to the wrong sequence.
65	
66	- Only one thread may write a given pin. A reset process that also drives pins needs an explicit arbiter.
67	
68	- AXI4-Lite has no transaction IDs, so responses complete in order. ID-based matching applies to full AXI4.
69	
70	**Practice.**
71	
72	- Q249 Component Hierarchy and Driver-Sequencer Handshake
73	
74	---
75	
76	## 02. Serialized pull driver and reset ownership
77	
78	Use this when the next transaction must wait for this one to finish on the bus. The invariant is that each acquired request is retired exactly once, and only one thread drives the pins. Template 08 is the concrete APB version.
79	
80	**Interview answer.** "My driver polls with `try_next_item` on every clock, so the same thread that owns the pins can also hold them idle during reset. It copies the routing ID into the response and calls `item_done` once, after the bus completes."
81	
82	Assumptions: `bus_req`, `bus_rsp`, the interface, and the `drive_one`/`drive_idle` helpers exist.
83	
84	```systemverilog
85	// Inside uvm_driver #(bus_req, bus_rsp)
86	task run_phase(uvm_phase phase);
87	  bus_req req;
88	  bus_rsp rsp;
89	  drive_status_e status;
90	
91	  forever begin
92	    @(vif.cb);
93	    if (vif.cb.rst_n !== 1'b1) begin
94	      drive_idle();
95	      continue;
96	    end
97	
98	    // Polling lets the single pin owner handle reset while idle
99	    seq_item_port.try_next_item(req);
100	    if (req == null) begin
101	      drive_idle();
102	      continue;
103	    end
104	
105	    rsp = bus_rsp::type_id::create("rsp");
106	    rsp.set_id_info(req);
107	    drive_one(req, rsp, status);
108	    rsp.status = status;
109	    drive_idle();
110	    seq_item_port.item_done(rsp);
111	  end
112	endtask
113	```
114	
115	**Shorter blocking form.** `get_next_item(req); drive_one(req, rsp, status); item_done(rsp);` works only if some other mechanism handles reset while the driver is idle.
116	
117	**APB outline (Q251).** Drive setup with `psel=1, penable=0`. On the next cycle drive access with `penable=1`. Hold address and control stable until `pready`. Sample read data and `pslverr` at completion, then go idle or start the next setup.
118	
119	**Reset questions to raise.** Is reset synchronous or asynchronous? Does an in-flight item abort or retry? How does the scoreboard flush predictions that reset cancelled?
120	
121	**Practice.**
122	
123	- Q250 Modify Driver for One Test Without Touching Other Tests
124	
125	---
126	
127	## 03. Decoupled driver with an owned request queue
128	
129	Use this when the sequence should continue as soon as the driver accepts an item. The invariant is that the sequence cannot change an object after the driver accepts it, and every response keeps the identity of its original request.
130	
131	**Interview answer.** "One thread accepts items, clones them, copies the routing ID, and puts the snapshot in a bounded mailbox before calling `item_done`. A second thread drives each snapshot and returns a response with `put_response`. The bounded mailbox gives the sequence backpressure, and the sequence must drain responses with `get_response`."
132	
133	```systemverilog
134	mailbox #(bus_req) pending = new(8);
135	
136	task accept_requests();
137	  bus_req req, snap;
138	  forever begin
139	    seq_item_port.get_next_item(req);
140	    if (!$cast(snap, req.clone()))
141	      `uvm_fatal("COPY", "Request clone failed")
142	    snap.set_id_info(req);
143	    pending.put(snap); // Blocks the sequence when the queue is full
144	    seq_item_port.item_done();
145	  end
146	endtask
147	
148	task execute_requests();
149	  bus_req snap;
150	  bus_rsp rsp;
151	  forever begin
152	    pending.get(snap);
153	    rsp = bus_rsp::type_id::create("rsp");
154	    rsp.set_id_info(snap);
155	    drive_to_completion(snap, rsp);
156	    seq_item_port.put_response(rsp);
157	  end
158	endtask
159	
160	task run_phase(uvm_phase phase);
161	  fork
162	    accept_requests();
163	    execute_requests();
164	  join
165	endtask
166	```
167	
168	**Why clone before ****`item_done`****.** `get(req)` finishes the handshake before it returns, so cloning afterward does not protect you from a sequence that reuses the object. Clone between `get_next_item` and `item_done`. Make sure `do_copy` copies every nested object the driver needs.
169	
170	**Sequence side.** The sequence must call `get_response()` for every item. Otherwise the response queue fills (default depth 8) and UVM reports an overflow error.
171	
172	**Practice.**
173	
174	- Q248 Mailbox vs Queue vs Associative Array - When to Use Which
175	
176	---
177	
178	## 04. Independent channels, multiple outstanding transactions, and AXI rules
179	
180	Use this when channels progress independently or several requests can be in flight. The invariant is that tracking state is registered before any response can arrive, and each transaction and credit is retired exactly once.
181	
182	**Interview answer.** "For an AXI write I fork the AW and W handshakes because either may finish first, then wait for B. For multiple outstanding transactions I split the driver into an acceptor, an issue worker, and a response worker. The issue worker records the transaction by ID before it drives the request, so an early response always finds its entry."
183	
184	```systemverilog
185	task drive_one_write(bus_req req, bus_rsp rsp);
186	  fork
187	    drive_aw_until_handshake(req);
188	    drive_w_until_handshake(req);
189	  join
190	  collect_b_response(rsp);
191	endtask
192	```
193	
194	Multi-outstanding algorithm:
195	
196	```text
197	acceptor:
198	    reserve one outstanding credit
199	    get request, clone it, keep routing IDs
200	    release the sequencer handshake
201	    enqueue the clone for the issue worker
202	
203	issue worker:
204	    allocate a free protocol ID (if the protocol has IDs)
205	    record the pending entry BEFORE a response can appear
206	    drive the request until its handshake completes
207	    record issue time
208	
209	response worker:
210	    observe the response handshake
211	    find the pending entry by ID, or by order if there are no IDs
212	    reject unknown, duplicate, stale, or early responses
213	    collect data beats until the last beat
214	    build the UVM response with the saved routing IDs
215	    retire the entry and free the ID and credit
216	
217	reset owner:
218	    stop accepting new requests
219	    abort every queued and in-flight entry exactly once
220	    reconcile credits and scoreboard expectations
221	    resume after reset is released
222	```
223	
224	**Choosing the tracking structure.**
225	
226	- In-order completion: one FIFO queue for reads and one for writes.
227	
228	- At most one active transaction per ID: associative array `pending[id]`.
229	
230	- Several active transactions with the same ID: a FIFO queue per ID.
231	
232	- Bursts: keep a beat counter next to each handle.
233	
234	**AXI 4KB boundary rule (Q114).** An AXI burst must not cross a 4KB address boundary. 4KB is the smallest address region a slave or memory page can own, so a crossing burst could hit two slaves while the interconnect decodes only the first address. WRAP bursts never cross because they are aligned to their total size (at most 16 beats of 128 bytes, 2KB). FIXED bursts do not increment. Only INCR bursts need the check.
235	
236	```systemverilog
237	// Stimulus: keep INCR bursts inside one 4KB page
238	constraint no_4k_cross_c {
239	  (burst == INCR) ->
240	    (((int'(addr[11:0]) >> size) << size) + ((int'(len) + 1) << size)) <= 4096;
241	}
242	
243	// Checker on the AW channel
244	function automatic bit crosses_4k(logic [31:0] a, logic [7:0] len, logic [2:0] size);
245	  int unsigned first = (int'(a[11:0]) >> size) << size;
246	  return (first + ((int'(len) + 1) << size)) > 4096;
247	endfunction
248	
249	ap_4k: assert property (@(posedge aclk) disable iff (!aresetn)
250	  awvalid && awburst == 2'b01 |-> !crosses_4k(awaddr, awlen, awsize));
251	```
252	
253	Worked case: `addr=0xFF0, size=2 (4 bytes), len=3` gives 4 beats ending at byte 0xFFF, which is legal. `len=4` adds a beat at 0x1000 and crosses.
254	
255	**Valid/ready handshake (Q65).** A transfer happens on a clock edge where `valid && ready`. The source must not wait for `ready` before asserting `valid`, and once `valid` is high it stays high with stable payload until the transfer. The destination may wait for `valid` before asserting `ready`.
256	
257	**Packet stream signals (Q72).** A stream interface needs `valid`, `ready`, `data`, an end-of-packet marker (`last`), byte enables or an empty count for the final beat (`keep`), and often a sideband (`user`) and error flag. AXI4-Stream uses TVALID, TREADY, TDATA, TKEEP, TLAST, TUSER.
258	
259	**Stress cases.** AW before W, W before AW, long backpressure, a reused ID, a response in the same cycle as issue, reset in the middle of a burst, a missing or extra `WLAST`/`RLAST`.
260	
261	**Practice.**
262	
263	- Q65 AXI Valid-Ready Handshake FSM
264	
265	- Q72 Packet Stream Interface Signals
266	
267	- Q114 AXI 4KB Boundary Restriction - Why and How
268	
269	- Q275 Multi-Channel DUT with Credit-Based Flow Control
270	
271	---
272	
273	## 05. Shared contract for the APB example
274	
275	Templates 06 to 13 build one connected APB testbench. Every component must agree on what counts as accepted, what reset cancels, and when the test is complete. Interviewers often ask you to state this contract before you write any code.
276	
277	**Interview answer.** "Before coding I fix the contract. The target is APB4 with 32-bit aligned word accesses and byte strobes. It behaves like plain memory, errors change nothing, and reset clears everything the model knows. The driver drives on the falling edge, and the monitor samples on the rising edge."
278	
279	**DUT contract.** One APB4 target. 32-bit byte addresses and data, word-aligned. Four byte strobes. PPROT tied to zero. The target behaves like plain memory. A successful write changes only enabled bytes. A successful read returns the stored bytes. An error response changes nothing. Reset clears the model. The smoke test writes every byte before reading it.
280	
281	**Timing contract.** The driver drives on the falling edge. The monitor samples on the rising edge with `#1step` input skew. Request signals stay stable through the accepting rising edge. Reset is sampled on a rising edge, so the driver cancels on the next clock instead of clearing pins asynchronously. A separate test watchdog catches a stopped clock or a stuck transfer.
282	
283	**APB facts.** A transfer is a setup phase followed by one or more access cycles. PREADY low extends access, and request signals hold steady while it is low. PSLVERR is valid only in the cycle where PSEL, PENABLE, and PREADY are all high (Arm IHI 0024D).
284	
285	**How the pieces connect.** 06 defines `apb_if`. 07 defines `apb_item`. 08 drives items onto the interface. 09 creates scenarios and consumes responses. 10 turns pin activity into transactions. 11 predicts and checks memory contents. 13 builds the environment and ends the test. Template 12 is the general matching method for other DUTs. The APB scoreboard does not depend on it.
286	
287	**Build order.** Compile the interface first. Then compile one package that imports `uvm_pkg`, includes `uvm_macros.svh`, and contains the item, driver, sequences, monitor, scoreboard, environment, and test. The top module supplies the DUT, clock, reset, and `uvm_config_db` setup.
288	
289	**Stress point.** A test can pass the driver's response checks while the monitor and scoreboard still find a mismatch. The driver's view of the bus is not independent evidence.
290	
291	---
292	
293	## 06. Interface, clocking blocks, and protocol checks
294	
295	Use this when you define the timing boundary between DUT, driver, and monitor. The invariant is that everyone drives and samples through declared clocking blocks, and request signals stay stable through stalls.
296	
297	**Interview answer.** "I use two clocking blocks. The driver drives on the falling edge so signals settle well before the DUT samples. The monitor samples on the rising edge with `#1step`, which reads the values from just before the edge, the same values the DUT and the assertions see. I put protocol assertions in the interface so every test gets them."
298	
299	The DUT owns PREADY, PRDATA, and PSLVERR. The driver owns the request pins. The top owns clock and reset.
300	
301	```systemverilog
302	interface apb_if(input logic pclk, input logic presetn);
303	  timeunit 1ns; timeprecision 1ps;
304	  logic psel, penable, pwrite;
305	  logic [31:0] paddr, pwdata, prdata;
306	  logic [3:0] pstrb;
307	  logic [2:0] pprot;
308	  logic pready, pslverr;
309	
310	  clocking drv_cb @(negedge pclk);
311	    default input #1step output #0;
312	    input presetn;
313	    output psel, penable, pwrite, paddr, pwdata, pstrb, pprot;
314	  endclocking
315	  clocking mon_cb @(posedge pclk);
316	    default input #1step;
317	    input presetn, psel, penable, pwrite, paddr, pwdata;
318	    input pstrb, pprot, pready, prdata, pslverr;
319	  endclocking
320	
321	  ap_setup: assert property (@(posedge pclk)
322	    disable iff (presetn !== 1'b1)
323	    psel && !penable |=> psel && penable &&
324	      $stable({paddr,pwrite,pwdata,pstrb,pprot}));
325	  ap_wait: assert property (@(posedge pclk)
326	    disable iff (presetn !== 1'b1)
327	    psel && penable && !pready |=> psel && penable &&
328	      $stable({paddr,pwrite,pwdata,pstrb,pprot}));
329	  ap_end: assert property (@(posedge pclk)
330	    disable iff (presetn !== 1'b1)
331	    psel && penable && pready |=> !penable);
332	  ap_read_strobes: assert property (@(posedge pclk)
333	    disable iff (presetn !== 1'b1)
334	    psel && !pwrite |-> pstrb == 4'b0);
335	endinterface
336	```
337	
338	**What a full checker adds.** A check that access always follows setup, X checks on control signals, address-range and error expectations, reset properties, and `cover property` statements so you can prove each check fired at least once.
339	
340	**Counterexample to walk.** PADDR changes during a stalled access, and `ap_wait` fires. A monitor that collects on PREADY alone counts idle cycles as transfers, because PREADY may be high while PSEL is low.
341	
342	**AHB adaptation (Q177).** AHB is pipelined. The address phase of transfer N+1 overlaps the data phase of transfer N, and HREADY low stretches both. Put HTRANS, HADDR, HWRITE, HSIZE, HBURST, and HWDATA in the driver clocking block, and sample HREADY, HRDATA, and HRESP in the monitor block. Template 10 shows the monitor logic.
343	
344	**Practice.**
345	
346	- Q152 SVA: APB Protocol Assertion - PSEL to PENABLE to PREADY
347	
348	- Q177 SV Coding: AHB Interface with Clocking Blocks
349	
350	- Q224 Interface, Monitor, and uvm\_config\_db Setup
351	
352	- Q226 Where to Set Virtual Interface in uvm\_config\_db
353	
354	---
355	
356	## 07. Sequence items: bus transfers and DMA descriptors
357	
358	Use this when you define the object passed between sequence, driver, monitor, and checker. The invariant is that only request fields are random, observed fields stay four-state so X is visible, and nested objects have an explicit copy rule.
359	
360	**Interview answer.** "Request fields are `rand` and carry legality constraints. Response fields like `rdata` are `logic` and not random, so an X from the DUT stays visible. I register fields with the factory macros, and I compare only the fields that matter instead of calling the generic `compare()`."
361	
362	```systemverilog
363	typedef enum {APB_OK, APB_ERR, APB_RESET} apb_status_e;
364	class apb_item extends uvm_sequence_item;
365	  rand bit [31:0] addr, wdata;
366	  rand bit write;
367	  rand bit [3:0] strb;
368	  logic [31:0] rdata;
369	  apb_status_e status;
370	  constraint legal_c {
371	    addr[1:0] == 0;
372	    addr inside {[32'h0:32'h3fc]};
373	    if (!write) strb == 0;
374	  }
375	  `uvm_object_utils_begin(apb_item)
376	    `uvm_field_int(addr, UVM_DEFAULT)
377	    `uvm_field_int(wdata, UVM_DEFAULT)
378	    `uvm_field_int(write, UVM_DEFAULT)
379	    `uvm_field_int(strb, UVM_DEFAULT)
380	    `uvm_field_int(rdata, UVM_DEFAULT)
381	    `uvm_field_enum(apb_status_e, status, UVM_DEFAULT)
382	  `uvm_object_utils_end
383	  function new(string name = "apb_item");
384	    super.new(name);
385	    status = APB_RESET;
386	  endfunction
387	endclass
388	```
389	
390	**Adaptations.** For error injection, add a negative-test subclass or turn off `legal_c` with `constraint_mode(0)` (Template 17). Record response latency as an observed field. Field macros keep the example short. In production code many teams write `do_copy` and `do_compare` by hand because the macros are slow and hide behavior.
391	
392	### DMA descriptor adaptation (Q215)
393	
394	The transaction is a copy command, not a bus beat. The descriptor gives source, destination, and length. The expected destination data is predicted from source memory, never randomized.
395	
396	Example rules: contiguous copy, 32-bit addresses, 4-byte alignment, 4 to 4096 bytes, no overlap, no address wrap.
397	
398	```systemverilog
399	class dma_item extends uvm_sequence_item;
400	  rand bit [31:0] src, dst;
401	  rand int unsigned nbytes;
402	  constraint legal_c {
403	    nbytes inside {[4:4096]};
404	    nbytes % 4 == 0;
405	    src[1:0] == 0; dst[1:0] == 0;
406	    (longint'(src) + nbytes) <= 64'h1_0000_0000;
407	    (longint'(dst) + nbytes) <= 64'h1_0000_0000;
408	    ((longint'(src) + nbytes) <= longint'(dst)) ||
409	    ((longint'(dst) + nbytes) <= longint'(src));
410	  }
411	  `uvm_object_utils_begin(dma_item)
412	    `uvm_field_int(src, UVM_DEFAULT)
413	    `uvm_field_int(dst, UVM_DEFAULT)
414	    `uvm_field_int(nbytes, UVM_DEFAULT)
415	  `uvm_object_utils_end
416	  function new(string name = "dma_item"); super.new(name); endfunction
417	endclass
418	```
419	
420	The `longint'` casts stop `src + nbytes` from wrapping at 32 bits. A programming sequence turns the descriptor into register writes and a start command. A memory responder supplies source bytes. The scoreboard snapshots the source when the copy starts, predicts the destination writes, and checks completion separately from register programming. Add channel, stride, or descriptor-chain fields only when the spec has them.
421	
422	**Trace.** `src=0x100, dst=0x200, nbytes=16` predicts four word writes. With overlap forbidden, `dst=0x108` must fail randomization.
423	
424	**Practice.**
425	
426	- Q117 Transaction Constraints and Burst Statistics
427	
428	- Q215 UVM: Design a DMA Engine uvm\_sequence\_item
429	
430	- Q243 Component vs Object, Field Automation, copy vs clone
431	
432	---
433	
434	## 08. APB driver: setup, access, wait states, and reset
435	
436	Use this to implement Template 02 for the Template 05 contract. The invariant is that one thread owns the pins and each acquired request gets exactly one `item_done(response)`.
437	
438	**Interview answer.** "On a falling edge I drive setup. On the next falling edge I raise PENABLE. Then I sample PREADY on each rising edge until it is high, capture PRDATA and PSLVERR, and return to idle. If reset appears, I abort, mark the response APB\_RESET, and still call `item_done` once."
439	
440	This driver leaves one idle cycle between transfers. It is simple, not maximum throughput.
441	
442	```systemverilog
443	class apb_driver extends uvm_driver #(apb_item);
444	  `uvm_component_utils(apb_driver)
445	  virtual apb_if vif;
446	  function new(string name, uvm_component parent);
447	    super.new(name, parent);
448	  endfunction
449	  function void build_phase(uvm_phase phase);
450	    super.build_phase(phase);
451	    if (!uvm_config_db#(virtual apb_if)::get(this, "", "vif", vif))
452	      `uvm_fatal("NOVIF", "APB interface missing")
453	  endfunction
454	  task idle(); // Call only at a drv_cb event.
455	    vif.drv_cb.psel <= 0;
456	    vif.drv_cb.penable <= 0;
457	    vif.drv_cb.pwrite <= 0;
458	    vif.drv_cb.paddr <= 0;
459	    vif.drv_cb.pwdata <= 0;
460	    vif.drv_cb.pstrb <= 0;
461	    vif.drv_cb.pprot <= 0;
462	  endtask
463	  task transfer(apb_item q, apb_item r);
464	    // Entry is a falling-edge drv_cb event.
465	    r.status = APB_RESET;
466	    vif.drv_cb.psel <= 1;
467	    vif.drv_cb.penable <= 0;
468	    vif.drv_cb.paddr <= q.addr;
469	    vif.drv_cb.pwrite <= q.write;
470	    vif.drv_cb.pwdata <= q.wdata;
471	    vif.drv_cb.pstrb <= q.strb;
472	    vif.drv_cb.pprot <= 0;
473	    @(vif.mon_cb); // Rising edge samples setup, not completion.
474	    if (vif.mon_cb.presetn !== 1'b1) begin
475	      @(vif.drv_cb); idle(); return;
476	    end
477	    @(vif.drv_cb);
478	    if (vif.drv_cb.presetn !== 1'b1) begin
479	      idle(); return;
480	    end
481	    vif.drv_cb.penable <= 1;
482	    forever begin
483	      @(vif.mon_cb);
484	      if (vif.mon_cb.presetn !== 1'b1) break;
485	      if ($isunknown(vif.mon_cb.pready))
486	        `uvm_fatal("XREADY", "PREADY unknown during access")
487	      if (vif.mon_cb.pready === 1'b1) begin
488	        if ($isunknown(vif.mon_cb.pslverr))
489	          `uvm_fatal("XERR", "PSLVERR unknown at completion")
490	        r.rdata = vif.mon_cb.prdata;
491	        r.status = vif.mon_cb.pslverr ? APB_ERR : APB_OK;
492	        break;
493	      end
494	    end
495	    @(vif.drv_cb); idle();
496	  endtask
497	  task run_phase(uvm_phase phase);
498	    apb_item q, r;
499	    forever begin
500	      @(vif.drv_cb);
501	      idle();
502	      if (vif.drv_cb.presetn !== 1'b1) continue;
503	      q = null;
504	      seq_item_port.try_next_item(q);
505	      if (q == null) continue;
506	      r = apb_item::type_id::create("r");
507	      r.copy(q);
508	      r.set_id_info(q);
509	      transfer(q, r);
510	      seq_item_port.item_done(r);
511	    end
512	  endtask
513	endclass
514	```
515	
516	**Trace.** Call the falling edges F0, F1, ... and the rising edges R1, R2, .... F0 drives setup. R1 samples setup. F1 drives access. R2 completes the transfer if PREADY is high. With two wait states, R2 and R3 see identical request signals and R4 completes. The next falling edge returns to idle, then the driver calls `item_done`. If reset is sampled at R3, the driver aborts and the monitor publishes no transfer for that access.
517	
518	**When a transfer hangs.** The watchdog in Template 13 ends the test. Do not abandon an unfinished APB access and report it as a timeout completion. If the spec requires recovery, coordinate a reset and retire the cancelled work. If pins must clear asynchronously on reset, redesign pin ownership around reset rather than adding a second thread that writes the pins.
519	
520	**Practice.**
521	
522	- Q251 APB Driver - Full Implementation
523	
524	---
525	
526	## 09. Sequences: directed, randomized, and virtual
527	
528	Use this to generate legal scenarios and to coordinate several sequencers. The invariant is that a sequence creates a fresh object for every request, consumes every response, and does not confuse "stimulus finished" with "verification finished".
529	
530	**Interview answer.** "`start_item` waits for the sequencer to grant arbitration. I randomize between `start_item` and `finish_item` so late randomization can react to current state. `finish_item` returns when the driver calls `item_done`. That tells me the driver finished the handshake, not that the DUT was correct. The scoreboard decides correctness."
531	
532	In this example the test owns the objection. The sequence only generates requests and reads responses.
533	
534	```systemverilog
535	class apb_smoke_seq extends uvm_sequence #(apb_item);
536	  `uvm_object_utils(apb_smoke_seq)
537	  function new(string name = "apb_smoke_seq");
538	    super.new(name);
539	  endfunction
540	  task body();
541	    apb_item q, r;
542	    for (int pass = 0; pass < 2; pass++) begin
543	      for (int i = 0; i < 8; i++) begin
544	        q = apb_item::type_id::create("q");
545	        start_item(q);
546	        q.addr = 4*i;
547	        q.write = (pass == 0);
548	        q.strb = q.write ? 4'hf : 4'h0;
549	        q.wdata = 32'ha5a50000 ^ i;
550	        finish_item(q);
551	        get_response(r);
552	        if (r.status != APB_OK)
553	          `uvm_fatal("SMOKE", "Unexpected error/reset in smoke test")
554	      end
555	    end
556	  endtask
557	endclass
558	```
559	
560	**Randomized variant.** Between `start_item(q)` and `finish_item(q)`, call `if (!q.randomize() with {write == 1; strb == 4'hf;}) `uvm\_fatal(...)`. Do not consume time in that window. A reset-stress sequence must expect `APB\_RESET\`, decide whether to retry, and rewrite memory before reading it again.
561	
562	### Virtual sequence adaptation
563	
564	A virtual sequence coordinates child sequences on real sequencers. Each child gets its own object and an explicit sequencer handle.
565	
566	```systemverilog
567	class dual_apb_vseq extends uvm_sequence;
568	  `uvm_object_utils(dual_apb_vseq)
569	  uvm_sequencer #(apb_item) left_sqr, right_sqr;
570	  function new(string name = "dual_apb_vseq");
571	    super.new(name);
572	  endfunction
573	  task body();
574	    apb_smoke_seq left, right;
575	    if (left_sqr == null || right_sqr == null)
576	      `uvm_fatal("NOSQR", "Child sequencer handle missing")
577	    left = apb_smoke_seq::type_id::create("left");
578	    right = apb_smoke_seq::type_id::create("right");
579	    fork
580	      left.start(left_sqr);
581	      right.start(right_sqr);
582	    join
583	  endtask
584	endclass
585	```
586	
587	**`start(null)`**** (Q246).** Assign both handles, then call `vseq.start(null)`. That is legal because the virtual sequence never sends items itself. A sequence that sends items with `start_item` needs a real sequencer, and with `null` it fails at `start_item`.
588	
589	**Virtual sequencer pattern (Q245).** The alternative stores the child sequencer handles in a virtual sequencer component, assigned in `connect_phase`. The virtual sequence reaches them through `p_sequencer` after `` `uvm_declare_p_sequencer ``.
590	
591	**Several sequences on one sequencer (Q244, Q257).** The sequencer arbitrates. Use `set_arbitration(UVM_SEQ_ARB_STRICT_FIFO)` with a priority argument to `start()` for priority, or `lock()`/`grab()` for exclusive access. To trace which sequence produced an item, read `item.get_parent_sequence()` or the sequence ID, and route the response with `set_id_info`.
592	
593	**Several item types (Q207).** Parameterize the sequencer and driver with a common base class and `$cast` to the subtype in the driver.
594	
595	**Stress cases.** Two concurrent writers to the same address need an ordering-aware model or disjoint address ranges. Never start one sequence object twice at the same time.
596	
597	**Practice.**
598	
599	- Q207 Multiple Sequence-Item Types Through One Sequencer
600	
601	- Q234 Sequence with Inline Constraint + Parallel Fork-Join + Event Sync
602	
603	- Q244 Highest Priority Completed Sequence
604	
605	- Q245 Virtual Sequencer - Two Usage Patterns
606	
607	- Q246 seq.start(null) - What Happens When Sequencer Is null?
608	
609	- Q257 Five Sequences on One Sequencer - Track Which Transaction Came from Which Sequence
610	
611	---
612	
613	## 10. Monitor: completed transfers and reset events
614	
615	Use this to turn pin activity into checker input. The invariant is one new transaction per completed transfer. A stalled cycle or a request alone produces nothing.
616	
617	**Interview answer.** "The monitor is passive and independent of the driver. It samples through the monitor clocking block and publishes a transaction only on the cycle where PSEL, PENABLE, and PREADY are all high. It sends reset as an event in the same analysis stream so the scoreboard sees reset in the right order relative to transfers."
618	
619	```systemverilog
620	class apb_monitor extends uvm_monitor;
621	  `uvm_component_utils(apb_monitor)
622	  virtual apb_if vif;
623	  uvm_analysis_port #(apb_item) ap;
624	  function new(string name, uvm_component parent);
625	    super.new(name, parent);
626	    ap = new("ap", this);
627	  endfunction
628	  function void build_phase(uvm_phase phase);
629	    super.build_phase(phase);
630	    if (!uvm_config_db#(virtual apb_if)::get(this, "", "vif", vif))
631	      `uvm_fatal("NOVIF", "APB interface missing")
632	  endfunction
633	  task run_phase(uvm_phase phase);
634	    apb_item t;
635	    bit in_reset = 0;
636	    forever begin
637	      @(vif.mon_cb);
638	      if (vif.mon_cb.presetn !== 1'b1) begin
639	        if (!in_reset) begin
640	          t = apb_item::type_id::create("reset_event");
641	          t.status = APB_RESET; ap.write(t);
642	        end
643	        in_reset = 1;
644	        continue;
645	      end
646	      in_reset = 0;
647	      if ($isunknown({vif.mon_cb.psel,vif.mon_cb.penable}))
648	        `uvm_fatal("XCTRL", "Unknown request control")
649	      if (vif.mon_cb.psel && vif.mon_cb.penable) begin
650	        if ($isunknown(vif.mon_cb.pready))
651	          `uvm_fatal("XREADY", "Unknown access completion")
652	        if (vif.mon_cb.pready) begin
653	          if ($isunknown({vif.mon_cb.paddr,vif.mon_cb.pwrite,
654	                          vif.mon_cb.pstrb,vif.mon_cb.pslverr}))
655	            `uvm_fatal("XTXN", "Unknown completed-transfer metadata")
656	          if (vif.mon_cb.pwrite && $isunknown(vif.mon_cb.pwdata))
657	            `uvm_fatal("XDATA", "Unknown write data in this test contract")
658	          t = apb_item::type_id::create("observed");
659	          t.addr = vif.mon_cb.paddr; t.write = vif.mon_cb.pwrite;
660	          t.strb = vif.mon_cb.pstrb; t.wdata = vif.mon_cb.pwdata;
661	          t.rdata = vif.mon_cb.prdata;
662	          t.status = vif.mon_cb.pslverr ? APB_ERR : APB_OK;
663	          ap.write(t);
664	        end
665	      end
666	    end
667	  endtask
668	endclass
669	```
670	
671	**Analysis port rules.** Every subscriber receives the same handle, and `write()` is a function, so it cannot wait. Never modify a published object. A subscriber that keeps the object for later should copy it.
672	
673	**AHB monitor adaptation (Q177).** Keep a one-deep "pending address phase" register. On each rising edge where HREADY is high, first complete the pending transfer using HRDATA or HWDATA and HRESP, then capture a new address phase if HTRANS is NONSEQ or SEQ. The order matters because one HREADY edge ends the previous data phase and accepts the next address.
674	
675	```text
676	on each rising edge:
677	    if pending.valid and HREADY:
678	        publish {pending.addr, pending.write, HWDATA or HRDATA, HRESP}
679	        pending.valid = 0
680	    if HREADY and HSEL and HTRANS in {NONSEQ, SEQ}:
681	        pending = {HADDR, HWRITE, HSIZE, HBURST}, valid = 1
682	```
683	
684	**Interrupt monitor and testbench (Q175).** First ask whether the interrupt is level or edge, and how it clears (often write-1-to-clear). The monitor timestamps each assertion and publishes an event. The checker predicts which source should fire, then checks the latency bound, that the line stays high until cleared, and that no interrupt fires while masked or without a cause. The test sequence services the interrupt by reading the status register and clearing the bit.
685	
686	**Practice.**
687	
688	- Q175 SV Coding: Monitor and Testbench for Interrupt Protocol
689	
690	- Q273 Serial-to-Parallel DUT - Driver, Monitor, Scoreboard
691	
692	- Q284 req/ack Handshake Testbench with Latency Checking
693	
694	---
695	
696	## 11. Scoreboard: prediction and sparse byte memory
697	
698	Use this to check a memory-like DUT with byte-enable writes. The invariant is that observation, prediction, comparison, and retirement are separate steps, and the expected value never comes from the output being checked.
699	
700	**Interview answer.** "I model memory as an associative array of bytes indexed by address, so it costs memory only for addresses the test touches. A successful write updates only the bytes whose strobe is set. A read compares each byte with `!==`, so an X from the DUT fails. Reading a byte the test never wrote is reported as an error, not silently accepted."
701	
702	```systemverilog
703	class apb_mem_scoreboard extends uvm_scoreboard;
704	  `uvm_component_utils(apb_mem_scoreboard)
705	  uvm_analysis_imp #(apb_item, apb_mem_scoreboard) imp;
706	  logic [7:0] mem[bit [31:0]];
707	  int unsigned observed = 0, reads_checked = 0, errors = 0;
708	  function new(string name, uvm_component parent);
709	    super.new(name, parent);
710	    imp = new("imp", this);
711	  endfunction
712	  function void write(apb_item t);
713	    bit [31:0] a;
714	    if (t.status == APB_RESET) begin
715	      mem.delete();
716	      return;
717	    end
718	    observed++;
719	    if (t.status != APB_OK) begin
720	      errors++;
721	      `uvm_error("BUSERR", "Unexpected error in memory smoke contract")
722	      return;
723	    end
724	    if (t.addr[1:0] != 0 || t.addr > 32'h3fc) begin
725	      `uvm_error("ADDR", "Address outside modeled contract")
726	      return;
727	    end
728	    if (t.write) begin
729	      for (int b = 0; b < 4; b++) begin
730	        a = t.addr + b;
731	        if (t.strb[b]) mem[a] = t.wdata[8*b +: 8];
732	      end
733	    end else begin
734	      for (int b = 0; b < 4; b++) begin
735	        a = t.addr + b;
736	        if (!mem.exists(a))
737	          `uvm_error("UNINIT", $sformatf("Unknown expected byte %h", a))
738	        else if (t.rdata[8*b +: 8] !== mem[a])
739	          `uvm_error("MISMATCH",
740	            $sformatf("addr=%h expected=%h actual=%h",
741	                      a, mem[a], t.rdata[8*b +: 8]))
742	      end
743	      reads_checked++;
744	    end
745	  endfunction
746	endclass
747	```
748	
749	For wider addresses change the key type, for example `bit [7:0] mem[bit [63:0]]`. This scoreboard checks the DUT against observed traffic. It does not check that the driver sent what the sequence intended. That needs a separate intent-versus-observed check.
750	
751	**Worked strobe case (Q216).** Write `0x11223344` to address 0, then write `0xAABBCCDD` with strobe `4'b0101`. Lanes 0 and 2 change, so the expected word is `0x11BB33DD`. A model that overwrites the whole word predicts `0xAABBCCDD` and reports a false mismatch.
752	
753	**Extensions.** Read-only, write-1-to-clear, and clear-on-read registers need access-policy prediction (Template 14). With several writers, define the global order (for example, the order the monitor at the memory port sees) instead of trusting callback arrival order (Q218). For expected bus errors, predict the error and its side effects.
754	
755	**Practice.**
756	
757	- Q216 UVM: Fix Scoreboard to Support Byte-Enable Writes
758	
759	- Q217 SV/C++: Data Structure for Sparse Memory in Verification
760	
761	- Q218 Verification: Handling Concurrent Writes to Sparse Memory Model
762	
763	- Q297 Memory Verification - Complete Strategy and UVM Environment
764	
765	---
766	
767	## 12. Scoreboard: matching, reordering, and reconstruction
768	
769	Use this when expected and actual transactions arrive on separate streams, possibly reordered. The invariant is that each completed operation matches exactly once, and anything left unmatched at end of test is an error.
770	
771	**Interview answer.** "I key both sides on something the monitor can observe, such as port plus ID. Each key holds a FIFO on the expected side and a FIFO on the actual side, so the actual can arrive first. When both FIFOs for a key are non-empty I pop and compare. A watchdog flags entries older than the latency bound, and at end of test both tables must be empty."
772	
773	**Choosing the structure.** Strict in-order: one expected FIFO and one actual FIFO. Reordering across IDs with in-order completion per ID: a queue per ID. Compute the key on both arrivals independently.
774	
775	```text
776	key = (reset_epoch, source_port, protocol_id)
777	expected[key] and actual[key] are FIFO queues of copied transactions
778	
779	on_expected(e):
780	    enqueue copy of e with its time
781	    match(key(e))
782	on_actual(a):
783	    enqueue copy of a with its time
784	    match(key(a))
785	match(k):
786	    while expected[k] and actual[k] are both non-empty:
787	        e = pop expected[k]; a = pop actual[k]
788	        compare only the fields the spec defines
789	        delete empty queues
790	periodic_watchdog(now):
791	    check every unmatched entry on BOTH sides
792	    fail any entry older than the latency bound
793	on_reset:
794	    report or cancel every outstanding entry
795	    flush queues, advance the epoch, resume
796	end_of_test (check_phase):
797	    both tables empty AND sent count == completed count
798	```
799	
800	**Pipelined adder, strict order (Q204).** One queue. For unsigned 32-bit inputs with a 33-bit result, predict `{1'b0,a} + {1'b0,b}` only when the input is accepted. Pop the oldest prediction for each accepted output. Stall cycles create nothing.
801	
802	**ID reordering (Q166, Q281).** A queue per ID works only if same-ID responses stay in order. If they do not, you need another observable key. Never invent a sequence number the monitor cannot see.
803	
804	**Duplicates (Q222, Q271).** With a unique token per transaction, keep a set of retired tokens and fail on a repeat. With reusable IDs, the ID alone cannot tell a duplicate from a new transaction, so you need a rule from the spec. A leftover entry at timeout is not proof of a duplicate.
805	
806	**Split and reassemble (Q280, Q285).** A 512-bit transaction over a 64-bit link is 8 beats. Track expected length, a received-beat bitmap, beat index, byte enables, and the last marker. Reject duplicate or out-of-range beats. Compare only after the packet is complete. Time out missing beats.
807	
808	**Leading drop and garbage bits (Q268).** Define the alignment rule first, for example "the first valid byte follows the start marker". Then discard input before the marker in the model, not in the comparator.
809	
810	**Adversarial traces.** The actual for key 7 arrives before its prediction, waits, then matches once. Two predictions share ID 3 and need two queue entries, not one overwritten array slot. An unmatched actual must fail end-of-test even when the expected table is empty.
811	
812	**Practice.**
813	
814	- Q166 Associative Arrays in a UVM Scoreboard
815	
816	- Q204 Pipelined Adder Scoreboard
817	
818	- Q214 UVM: DMA Scoreboard Implementation
819	
820	- Q219 UVM: Scoreboard Design for 10-Input to 20-Output Port Mapping
821	
822	- Q222 UVM: Scoreboard with Timeout and Duplicate Detection (A/B Pairing)
823	
824	- Q229 Verification Environment for 2-Input 10-Output Random Dispatch DUT
825	
826	- Q268 SCB Design with Leading Drop and Garbage Bits
827	
828	- Q271 Scoreboard for Paired A/B Transactions with Timeout
829	
830	- Q280 512-bit Transaction Split-Reassemble Over 64-bit Link
831	
832	- Q281 Out-of-Order Scoreboard - Track and Match with Associative Array
833	
834	- Q285 Out-of-Order Packet Scoreboard with Reconstruction
835	
836	---
837	
838	## 13. Environment, configuration, phases, and test completion
839	
840	Use this to wire components, apply configuration and overrides, and end the test for a defensible reason. The invariant is: configure and override before creation, connect after creation, and drop the final objection only after the checks have finished.
841	
842	**Interview answer.** "`build_phase` runs top-down, so a parent sets config and factory overrides before it creates children. `connect_phase` runs bottom-up after every component exists. `run_phase` is the only common phase that takes time. The test raises an objection, starts the sequence, waits until the scoreboard has drained, and then drops the objection. A watchdog catches hangs."
843	
844	**Construction rules.**
845	
846	- A parent sets `uvm_config_db` values for children before they read them in `build_phase`.
847	
848	- Install factory overrides before the `create()` call they affect. If the base class's `super.build_phase()` creates children, the override must come before that call (Q255).
849	
850	- Connect sequencer to driver and monitor to scoreboard in `connect_phase`. Fail loudly when a config lookup returns nothing.
851	
852	- Keep "stimulus done", "bus done", and "scoreboard drained" as three separate conditions.
853	
854	```systemverilog
855	class apb_env extends uvm_env;
856	  `uvm_component_utils(apb_env)
857	  uvm_sequencer #(apb_item) sqr;
858	  apb_driver drv;
859	  apb_monitor mon;
860	  apb_mem_scoreboard scb;
861	  function new(string name, uvm_component parent);
862	    super.new(name, parent);
863	  endfunction
864	  function void build_phase(uvm_phase phase);
865	    super.build_phase(phase);
866	    sqr = uvm_sequencer#(apb_item)::type_id::create("sqr", this);
867	    drv = apb_driver::type_id::create("drv", this);
868	    mon = apb_monitor::type_id::create("mon", this);
869	    scb = apb_mem_scoreboard::type_id::create("scb", this);
870	  endfunction
871	  function void connect_phase(uvm_phase phase);
872	    super.connect_phase(phase);
873	    drv.seq_item_port.connect(sqr.seq_item_export);
874	    mon.ap.connect(scb.imp);
875	  endfunction
876	endclass
877	
878	class apb_test extends uvm_test;
879	  `uvm_component_utils(apb_test)
880	  apb_env env;
881	  function new(string name, uvm_component parent);
882	    super.new(name, parent);
883	  endfunction
884	  function void build_phase(uvm_phase phase);
885	    super.build_phase(phase);
886	    env = apb_env::type_id::create("env", this);
887	  endfunction
888	  task run_phase(uvm_phase phase);
889	    apb_smoke_seq s;
890	    phase.raise_objection(this);
891	    s = apb_smoke_seq::type_id::create("s");
892	    fork
893	      begin
894	        fork
895	          begin
896	            s.start(env.sqr);
897	            wait (env.scb.observed >= 16);
898	            if (env.scb.observed != 16 ||
899	                env.scb.reads_checked != 8 || env.scb.errors != 0)
900	              `uvm_error("COUNTS", "Unexpected observed completion counts")
901	          end
902	          begin
903	            #100us;
904	            `uvm_fatal("WATCHDOG", "Smoke test failed to complete")
905	          end
906	        join_any
907	        disable fork;
908	      end
909	    join
910	    phase.drop_objection(this);
911	  endtask
912	endclass
913	```
914	
915	The environment owns the sequencer and driver directly to keep the example short. A reusable agent always builds its monitor but builds the driver and sequencer only when it is active. The package needs a `timeunit` for the `#100us` literal.
916	
917	The top module instantiates `apb_if` as `bus`, connects the DUT, generates clock and reset, and then:
918	
919	```systemverilog
920	initial begin
921	  uvm_config_db#(virtual apb_if)::set(
922	    null, "uvm_test_top.env.*", "vif", bus);
923	  run_test("apb_test");
924	end
925	```
926	
927	**config\_db arguments (Q225).** `set(context, instance_path, field_name, value)`. The context plus the path select which components see the value. `get(this, "", "vif", vif)` looks up the value for the calling component.
928	
929	**Entry point (Q254).** `run_test()` creates the test named by `+UVM_TESTNAME` or the argument, then runs the phases. "Test class not found" (Q238) almost always means the class is missing `` `uvm_component_utils ``, so the factory cannot create it by name.
930	
931	**Objections (Q221).** `run_phase` ends when every objection is dropped. A phase with no raised objection ends at time zero. A fixed drain time does not prove completion and cannot catch an objection that never drops. Use a watchdog or `set_timeout`.
932	
933	**Why UVM, and its cost (Q205).** UVM gives a standard structure, factory overrides, configuration, sequences, and a register layer, so testbenches are reusable and familiar to new engineers. The cost is a steep learning curve, verbose code, slower simulation, and more setup than a small block needs.
934	
935	**Simulator invocations (Q227).** Compile and elaborate once, then run one simulation per test and seed. A smoke script with N tests needs one build plus N runs. Rebuilding for every test wastes time.
936	
937	**Validation list for this example.** Compile everything. Run zero-wait smoke. Inject two wait states. Inject reset in setup and in access with a reset-aware sequence. Corrupt one read byte. Exercise partial strobes. Hold PREADY low forever. Stop the clock. Legal cases must pass, reset must abort cleanly, corrupted data must mismatch, and hangs must hit the watchdog. A passing response count alone is not a passing test, so count every UVM error and assertion failure.
938	
939	**Practice.**
940	
941	- Q205 UVM Advantages and Adoption Costs
942	
943	- Q208 UVM Factory Creation and Overrides
944	
945	- Q209 UVM: Architecture Overview
946	
947	- Q210 UVM: run\_phase Ordering and drop\_objection Behavior
948	
949	- Q211 UVM Phases: Task Phases vs Function Phases
950	
951	- Q212 UVM: Inter-process Synchronization Methods
952	
953	- Q220 UVM: Phase Mechanism - What It Is and How It Works
954	
955	- Q221 UVM Objection Mechanism
956	
957	- Q225 uvm\_config\_db Four Parameters Explained
958	
959	- Q227 How Many Simulator Invocations for a Smoke Test Script
960	
961	- Q231 Startup Flow and Top Module Contents
962	
963	- Q238 Test Class Not Found - Missing Factory Registration
964	
965	- Q242 Factory Registration and Out-of-Order Execution
966	
967	- Q247 Factory Override - Instance Override and Type Override
968	
969	- Q253 uvm\_object vs uvm\_component - Differences
970	
971	- Q254 Test Entry Point - run\_test() to Phase Execution
972	
973	- Q255 Factory Override - Why super.build\_phase() Must Come AFTER the Override
974	
975	---
976	
977	## 14. Register model and memory verification
978	
979	Use this when you separate register behavior from bus transport. The invariant is that bus activity, the DUT's real state, and the register model must agree under each field's access policy.
980	
981	**Interview answer.** "The register model mirrors the DUT's registers. A frontdoor access goes through the adapter and the real bus, so it tests address decode. A backdoor access reads or writes the HDL path directly, with no bus cycles. A predictor updates the mirror from monitored bus traffic. I compare frontdoor and backdoor results to catch decode bugs and aliasing."
982	
983	**Method.**
984	
985	- An adapter converts `uvm_reg_bus_op` to bus items with `reg2bus` and back with `bus2reg`.
986	
987	- Give every field an access policy: RO, WO, RW, W1C, RC, and so on.
988	
989	- Use frontdoor accesses to test decode and backdoor accesses to inspect storage.
990	
991	- Write a unique, address-dependent pattern to every location to expose aliasing.
992	
993	**What happens on a register write (Q237).** `reg.write()` builds a `uvm_reg_bus_op`, the adapter converts it to a bus item, the item runs on the bus sequencer, the driver drives it, and the predictor (explicit or auto) updates the mirror.
994	
995	**Write-only register testbench (Q230).** Reads return a defined value (often 0) or an error, so you cannot check by reading back. Check the register's effect instead, through the function it controls or a backdoor peek.
996	
997	**Aliasing with frontdoor only (Q256).** Write a unique value to each register, then read all of them back. Two registers that return the same last-written value share storage.
998	
999	**Memory swap bug (Q295).** Frontdoor-write a known pattern, backdoor-peek the storage. If address A's data lands in B's storage, the decode is swapped.
1000	
1001	**Firmware writes enable but the device does not start (Q291).** Check in order: did the write reach the bus (monitor), was the address decoded (backdoor peek), is the field really RW, is there a lock or clock gate, and is the DUT in reset.
1002	
1003	**Practice.**
1004	
1005	- Q230 Testbench for Write-Only Register
1006	
1007	- Q237 What Happens When a Sequence Issues a UVM RGM Register Write
1008	
1009	- Q240 Register Model Frontdoor vs Backdoor Access
1010	
1011	- Q252 Register Abstraction Layer (RAL) - Working Principle and Usage
1012	
1013	- Q256 Register Aliasing Detection Using Frontdoor Only
1014	
1015	- Q290 UVM Backdoor Access - HDL Path and Usage
1016	
1017	- Q295 Memory Debug - Frontdoor Write + Backdoor Peek to Find Swap Bug
1018	
1019	---
1020	
1021	## 15. Verification planning and coverage closure
1022	
1023	Use this when asked what to verify, how to observe it, and when you are done. The invariant is that each requirement has a stimulus, an automatic check, and a coverage goal.
1024	
1025	**Interview answer.** "I start from the spec and list features. For each feature I write down how to stimulate it, what checks it automatically, and which coverage proves I exercised it. I call it done when every requirement is checked and covered, regressions are clean across seeds, and the remaining holes are either waived with a reason or proven unreachable."
1026	
1027	| Requirement | Stimulus | Automated check | Coverage |
1028	| --- | --- | --- | --- |
1029	| Normal operation | Directed and constrained-random | Reference model comparison | Legal operation bins |
1030	| Boundaries | Min, max, wrap, empty, full | Boundary assertions | Boundary and transition bins |
1031	| Concurrency | Overlap, competing requests, stalls | Ordering and accounting checks | Targeted crosses |
1032	| Error and reset | Error injection, reset mid-transfer | Specified recovery behavior | Error and recovery scenarios |
1033	
1034	**Coverage below 100% (Q274).** Sort each hole into one of four causes: missing stimulus, behavior that is illegal or unreachable, an overconstrained generator, or a wrong coverage model. Each needs a different fix.
1035	
1036	**Code vs functional coverage (Q213).** Code coverage (line, branch, condition, toggle, FSM) shows what RTL ran. Functional coverage shows which spec features you exercised. You need both, because 100% code coverage can still miss an unimplemented feature.
1037	
1038	**Covergroup example (Q176, Q258).**
1039	
1040	```systemverilog
1041	covergroup cg_data @(posedge clk iff valid);
1042	  cp_data: coverpoint data {
1043	    bins zero     = {0};
1044	    bins max      = {8'hff};
1045	    bins low[4]   = {[1:127]};
1046	    bins high[4]  = {[128:254]};
1047	  }
1048	  cp_op: coverpoint op;
1049	  x_op_data: cross cp_op, cp_data;
1050	endgroup
1051	```
1052	
1053	In UVM, put the covergroup in a `uvm_subscriber` connected to the monitor, and sample it in `write()`.
1054	
1055	**Other frequent questions.**
1056	
1057	- Formal verification (Q270) proves a property for all inputs within a bound, using assumptions to rule out illegal inputs. It is strongest for control logic and weak for large datapaths.
1058	
1059	- Gate-level simulation (Q272) is still needed for reset and X behavior, timing-annotated paths, scan insertion, and synthesis assumptions that RTL simulation cannot see.
1060	
1061	- Emulation (Q357) runs the RTL on dedicated hardware, thousands of times faster than simulation, with good debug visibility. FPGA prototyping is faster still but has less visibility and needs RTL changes to fit the FPGA.
1062	
1063	- AI-generated code (Q294) must be reviewed like any other code, and its checks must be tested to show they can fail.
1064	
1065	**Practice.**
1066	
1067	- Q176 SV Coding: Covergroup for 8-bit Signal
1068	
1069	- Q213 UVM: Code Coverage Types
1070	
1071	- Q233 How to Determine if DUT Verification is Complete
1072	
1073	- Q235 Instruction Transaction with Covergroup and Forwarding Path
1074	
1075	- Q258 Functional Coverage: Covergroups, Coverpoints, Crosses, Bins, and a UVM Subscriber
1076	
1077	- Q259 Test Plan: SoC with Encryption/Decryption Module
1078	
1079	- Q261 Verification: SoC-Level Verification with CPU, DMA, and Peripherals
1080	
1081	- Q262 Verification: Test Plan for Address-Based Routing DUT (A/B Client)
1082	
1083	- Q270 Formal Verification - How It Works
1084	
1085	- Q272 Is Gate-Level Simulation Still Needed After RTL Verification?
1086	
1087	- Q274 Functional Coverage Not 100% - Analysis and Strategy
1088	
1089	- Q276 Constrained-Random Verification - How It Works
1090	
1091	- Q277 FP Multiplier ALU Verification Strategy
1092	
1093	- Q279 Systolic Array UVM Testbench - PE Level and Sub-System Level
1094	
1095	- Q283 Router UVM Testbench - Complete Design
1096	
1097	- Q288 PHY Link Training - Delay Code Sweep with PRBS Error Injection
1098	
1099	- Q289 12-Channel 32-bit Coverage Strategy
1100	
1101	- Q292 DV Environment for Software-Programmed Threshold Transaction Limiter
1102	
1103	- Q293 128-bit Parallel Bus - Stuck-at Fault and Short Wire Test Patterns
1104	
1105	- Q294 Using AI-Generated Code in Verification - Risks and Workflow
1106	
1107	- Q357 Emulation versus RTL Simulation and FPGA Prototyping
1108	
1109	---
1110	
1111	## 16. Failure triage and reproducibility
1112	
1113	Use this to explain how you debug a mismatch, a hang, X propagation, or a failure you cannot reproduce. The invariant is to find the earliest point of divergence, not the last symptom.
1114	
1115	**Interview answer.** "I reproduce with the same seed, build, and options. Then I find the first transaction where the DUT and the model disagree, and decide whether the DUT, the monitor, or the model is wrong. After the fix I add a regression test that hits that case."
1116	
1117	**Method.**
1118	
1119	1. Record seed, test name, simulator version, options, and source revision.
1120	
1121	2. Reproduce, then shrink the stimulus.
1122	
1123	3. Compare failing and passing runs at transaction boundaries.
1124	
1125	4. Decide which is wrong: DUT, monitor sampling, or reference model.
1126	
1127	5. Fix the cause and add a targeted test.
1128	
1129	**Hang (Q265).** Check which objections are still raised (`+UVM_OBJECTION_TRACE`), which threads are blocked, which bus transfers are pending, and which scoreboard queues are non-empty. Common causes are a missing `item_done`, a `wait` on an event that already fired, and a zero-delay loop.
1130	
1131	**Cannot reproduce (Q266).** Different build, different seed source, a race between processes, or uninitialized state.
1132	
1133	**X sources (Q267).** Uninitialized registers and memories, multiple drivers, undriven inputs, out-of-range array reads, X from power-down domains, and `case` without a default.
1134	
1135	**Multiple CPUs read inconsistent data (Q22).** Suspect coherence: a missing invalidation, a write-back that has not completed, or a missing memory barrier. Trace the line's coherence state per core (Template 34).
1136	
1137	**Stress cases.** The DUT is right but the monitor sampled the wrong cycle. The model ignores byte enables. The same seed produces different results on a different build.
1138	
1139	**Practice.**
1140	
1141	- Q22 Debug: Multiple CPUs Reading Inconsistent Data
1142	
1143	- Q265 Simulation Runs Forever - Debug Strategy
1144	
1145	- Q266 Cannot Reproduce Regression Bug
1146	
1147	- Q267 Sources of X-Propagation in Simulation
1148	
1149	- Q282 Debug Scoreboard Mismatch - Step-by-Step Approach
1150	
1151	- Q291 Firmware Writes 1 to enable\_reg but Device Does Not Start - Debug
1152	
1153	---
1154	
1155	## 17. Constraints: domains, relations, sums, and overrides
1156	
1157	Use this to generate arrays or transactions with coupled rules. The invariant is that the solver must satisfy domain, size, pairwise, and sum constraints at the same time, so you list all of them before you write any.
1158	
1159	**Interview answer.** "I write the size first, then the value range with `foreach`, then pairwise rules like uniqueness, then sums. For sums I cast inside `with` so the reduction cannot overflow. I always check the return value of `randomize()`."
1160	
1161	```systemverilog
1162	rand int unsigned a[];
1163	constraint c {
1164	  a.size() == 8;
1165	  foreach (a[i]) a[i] inside {[0:15]};
1166	  unique {a};                              // or the pairwise form below
1167	  // foreach (a[i]) foreach (a[j]) if (i < j) a[i] != a[j];
1168	  a.sum() with (int'(item)) == 60;
1169	}
1170	```
1171	
1172	**Sum width.** `a.sum()` uses the element width. With `bit [3:0]` elements, the sum wraps at 16. Cast inside `with` to the width the maximum sum needs. Here the maximum is `8*15 = 120`, so `int` is enough.
1173	
1174	**Without ****`unique`**** (Q136, Q138).** Use the nested `foreach` with `i < j`.
1175	
1176	**Exactly N ones without ****`$countones`**** (Q141).** `v.sum() with (int'(item)) == N` on a `bit` array, or loop over bits in a function.
1177	
1178	**Each value exactly K times (Q126).** Constraints cannot use `for`, so loop over a helper array of the legal values:
1179	
1180	```systemverilog
1181	int vals[6] = '{0, 1, 2, 3, 4, 5};
1182	constraint each_c {
1183	  arr.size() == 300;
1184	  foreach (vals[k]) arr.sum() with (int'(item == vals[k])) == 40;
1185	  foreach (arr[i]) if (i > 0) !(arr[i] == 0 && arr[i-1] == 0);   // no consecutive 0s
1186	}
1187	```
1188	
1189	### Overriding and disabling constraints
1190	
1191	There are three standard ways to change a parent's constraint without editing the parent (Q144):
1192	
1193	1. Declare a constraint with the same name in the child class. It replaces the parent's block.
1194	
1195	2. Turn the block off at the call site with `constraint_mode(0)`, then add an inline `randomize() with {...}`.
1196	
1197	3. Write the default as `soft`. Any hard constraint that conflicts with it wins.
1198	
1199	```systemverilog
1200	class base_item extends uvm_sequence_item;
1201	  `uvm_object_utils(base_item)
1202	  rand bit [7:0] len;
1203	  constraint len_c  { len inside {[1:16]}; }
1204	  constraint dflt_c { soft len == 4; }
1205	  function new(string name = "base_item"); super.new(name); endfunction
1206	endclass
1207	
1208	class long_item extends base_item;
1209	  `uvm_object_utils(long_item)
1210	  constraint len_c { len inside {[64:128]}; } // same name replaces the parent block
1211	  function new(string name = "long_item"); super.new(name); endfunction
1212	endclass
1213	
1214	// Method 2 at the call site
1215	item.len_c.constraint_mode(0);
1216	if (!item.randomize() with { len == 200; }) `uvm_fatal("RAND", "failed")
1217	
1218	// Method 3: soft len == 4 gives way to this hard constraint
1219	if (!item.randomize() with { len == 8; }) `uvm_fatal("RAND", "failed")
1220	```
1221	
1222	**Change constraints without touching the class or the sequence (Q232).** Use a factory override in the test: `base_item::type_id::set_type_override(long_item::get_type());`. Every `create()` of `base_item` now returns `long_item`.
1223	
1224	**Sequence vs item constraints (Q206).** Constraints in the item hold everywhere and describe legality. Inline constraints in a sequence apply to that one call and describe the scenario. Inside `with`, an unqualified name refers to the item first. Use `local::name` to refer to the sequence's variable.
1225	
1226	**Other controls.** `rand_mode(0)` freezes one variable. `pre_randomize` and `post_randomize` run around the solver (Q137 uses `post_randomize` to remember the last command).
1227	
1228	**Stress cases.** More unique values than the domain allows. Contradictory sums. A narrow sum that overflows silently. A child constraint that conflicts with a parent block you forgot existed.
1229	
1230	**Practice.**
1231	
1232	- Q118 Constraint: Address Alignment with CMD Signal
1233	
1234	- Q119 Constraint: Dynamic Array Sum and 2D Array Row Constraint
1235	
1236	- Q120 Constraint: Various Array Constraints
1237	
1238	- Q121 SV Constraint: 1D/2D Array Size, Value, and Ordering
1239	
1240	- Q122 SV Constraint: Dynamic Array with Sum Equal to 20
1241	
1242	- Q125 SV Constraint: rand bit Array with Odd Number of 1s
1243	
1244	- Q126 SV Constraint: 300-Element Array, Values 0-5, Each = 40 Times, No Consecutive 0s
1245	
1246	- Q131 Constraint Inheritance and constraint\_mode()
1247	
1248	- Q132 Consecutive Uniqueness & Cross-Array Common Element
1249	
1250	- Q134 Sudoku 9x9 Grid Constraint
1251	
1252	- Q135 Dynamic Array - Sum, Consecutive Ones, Unique in Range
1253	
1254	- Q136 Static Array Uniqueness - With and Without unique
1255	
1256	- Q138 1D Array - Unique Elements Without unique, Sum Constraint
1257	
1258	- Q141 Generate 4-bit Value with Exactly 4 Ones - No countones
1259	
1260	- Q143 7x7 Pixel Image - No All-D 3x3 Submatrix (Parameterized)
1261	
1262	- Q144 Overriding a Constraint in Child Class - Three Methods
1263	
1264	- Q168 Unique Constraints for a 2D Random Array
1265	
1266	- Q206 Constraints in a uvm\_sequence versus a uvm\_sequence\_item
1267	
1268	- Q232 Override Default Constraints Without Modifying the Class
1269	
1270	---
1271	
1272	## 18. Intervals, allocation, and alignment
1273	
1274	Use this for address regions, excluded ranges, or allocators. The invariant is to represent every region as half-open `[start, end)`, which makes adjacency and overlap tests simple.
1275	
1276	**Interview answer.** "I store each region as start plus length and compute end in a wider type so it cannot wrap. Two regions do not overlap when one ends at or before the other starts. Alignment is `start % align == 0`."
1277	
1278	```text
1279	end = start + length          // widen before adding
1280	start % alignment == 0
1281	no_overlap(i, j) = end_i <= start_j  OR  end_j <= start_i
1282	```
1283	
1284	```systemverilog
1285	rand bit [31:0] start[N];
1286	rand bit [31:0] len[N];
1287	constraint regions_c {
1288	  foreach (start[i]) {
1289	    len[i] inside {[1:256]};
1290	    start[i] % 32 == 0;
1291	    longint'(start[i]) + len[i] <= 1024;
1292	  }
1293	  foreach (start[i]) foreach (start[j])
1294	    if (i < j) (longint'(start[i]) + len[i] <= start[j]) ||
1295	               (longint'(start[j]) + len[j] <= start[i]);
1296	}
1297	```
1298	
1299	**Bitmask alignment.** `(start & (align - 1)) == 0` works only for power-of-two alignment. For alignment 6, address 8 passes the mask test but fails modulo.
1300	
1301	**Excluded range (Q128).** `!(addr inside {[EX_LO:EX_HI]});`
1302	
1303	**Repeated randomization until full (Q129).** Keep a list of allocated regions in the class and constrain each new region against all of them. Stop when randomization fails or the space is full.
1304	
1305	**2D rectangles (Q123).** Two rectangles do not overlap when one is completely left, right, above, or below the other: `x1+w1 <= x2 || x2+w2 <= x1 || y1+h1 <= y2 || y2+h2 <= y1`.
1306	
1307	**Stress cases.** Zero length, a region that fills the space exactly, wraparound at the top address, and adjacent regions that touch but do not overlap. Template 07 applies this to DMA descriptors.
1308	
1309	**Practice.**
1310	
1311	- Q123 SV Constraint: Non-Overlapping Rectangle Regions in 2D Array
1312	
1313	- Q128 SV Constraint: Memory Access with Excluded Range
1314	
1315	- Q129 SV Constraint: Repeatedly Randomize Non-Overlapping Memory Regions Until Full
1316	
1317	- Q139 1KB Address Space - Non-Overlapping 32-byte Stride Regions
1318	
1319	- Q241 DDR Memory Allocator Transaction with Spatial Constraints
1320	
1321	- Q287 Lane Redundancy Remapping - SV Constraint Generator
1322	
1323	---
1324	
1325	## 19. Runs, patterns, and history across randomizations
1326	
1327	Use this when a rule refers to neighbors, runs of bits, or previous transactions. The invariant is to keep rules within one randomization separate from state carried between calls.
1328	
1329	**Interview answer.** "Neighbor rules use `foreach` with a guarded index, like `if (i > 0)`. Rules about previous transactions use a non-random class variable that I update in `post_randomize`. I check that any shuffle or post-processing keeps the rules true."
1330	
1331	```systemverilog
1332	// Zeros may repeat, but a non-zero value never repeats back to back (Q127).
1333	// Confirm this reading with the interviewer first.
1334	foreach (a[i]) if (i > 0 && a[i] != 0) a[i] != a[i-1];
1335	
1336	// Alternate READ and WRITE across calls (Q137)
1337	bit last_was_write;
1338	constraint alt_c { write != last_was_write; }
1339	function void post_randomize(); last_was_write = write; endfunction
1340	```
1341	
1342	**Exactly one run of ones in 16 bits (Q124).** Randomize `start` and `len` with `start + len <= 16` and `len >= 1`, then build the value in `post_randomize`. Or use a constraint: the number of positions where bit i is 1 and bit i-1 is 0 (or i is 0) equals 1.
1343	
1344	**Symmetric array (Q130).** `foreach (a[i]) a[i] == a[N-1-i];`
1345	
1346	**`std::randomize`**** return value (Q133).** It returns 0 on failure and leaves the variables unchanged. Code that ignores the return value keeps using stale values silently.
1347	
1348	**`shuffle()`**** after constraints (Q142).** `shuffle()` runs after the solver and can break adjacency rules. Either express the order in constraints or re-check after shuffling.
1349	
1350	**Stress cases.** A run touching the first or last bit. A cyclic rule (Q140) that must compare the last element with the first. History that resets when a new object is created per transaction.
1351	
1352	**Practice.**
1353	
1354	- Q124 SV Constraint: Exactly One Consecutive Run of 1s in 16-bit Value
1355	
1356	- Q127 SV Constraint: 300-Element Array, 0 May Repeat, Non-Zero Values Must Not Be Consecutive
1357	
1358	- Q130 SV Constraint: Symmetric Array Using Helper Function
1359	
1360	- Q133 std::randomize Return Value Bug
1361	
1362	- Q137 Alternating READ/WRITE Transactions Using post\_randomize
1363	
1364	- Q140 8-bit Vector - No Cyclic Right Shift
1365	
1366	- Q142 Array with if-else Constraint, then shuffle()
1367	
1368	---
1369	
1370	## 20. Assertions: immediate vs concurrent, stability, bounded response
1371	
1372	Use this to turn a timing rule into an executable check. The invariant is to make the trigger, the delay, the obligation, the sampling clock, and the reset behavior explicit.
1373	
1374	**Interview answer.** "An immediate assertion is a procedural check that runs when the statement runs, like an `if`. A concurrent assertion samples signals on a clock in the Preponed region and checks a sequence over time. `|->` checks the consequent in the same cycle, and `|=>` checks it one cycle later. I add a `cover property` for each important assertion so a vacuous pass does not look like success."
1375	
1376	```systemverilog
1377	// Payload must stay stable while stalled
1378	assert property (@(posedge clk) disable iff (!rst_n)
1379	  valid && !ready |=> valid && $stable(payload));
1380	
1381	// ack within 1 to MAX_LAT cycles after req rises
1382	assert property (@(posedge clk) disable iff (!rst_n)
1383	  $rose(req) |-> ##[1:MAX_LAT] ack);
1384	cover property (@(posedge clk) $rose(req) ##[1:MAX_LAT] ack);
1385	
1386	// valid stays high until ready (Q148)
1387	assert property (@(posedge clk) disable iff (!rst_n)
1388	  valid && !ready |=> valid);
1389	
1390	// B toggles exactly 2 cycles after A toggles (Q153)
1391	assert property (@(posedge clk) disable iff (!rst_n)
1392	  $changed(a) |-> ##2 $changed(b));
1393	
1394	// cat followed by 3 or 4 dogs (Q149)
1395	assert property (@(posedge clk) cat |=> dog[*3:4] ##1 !dog);
1396	```
1397	
1398	**Immediate vs concurrent (Q361).**
1399	
1400	```systemverilog
1401	always_comb assert (!(gnt_a && gnt_b)) else $error("double grant"); // immediate
1402	always_comb assert final (!(gnt_a && gnt_b));                       // deferred
1403	```
1404	
1405	An immediate assertion can fire on a zero-width glitch while combinational logic settles. A deferred assertion (`assert #0` or `assert final`) reports only the value at the end of the time step. A concurrent assertion is clocked, can span many cycles, and can live in modules, interfaces, and checkers.
1406	
1407	**Region order (Q145).** Signals are sampled in Preponed, RTL runs in Active and NBA, assertions are evaluated in Observed, and action blocks run in Reactive. That is why an assertion sees the value from before the clock edge.
1408	
1409	**AHB burst must not cross 1KB (Q155).** Check that each SEQ beat stays in the page of the previous beat:
1410	
1411	```systemverilog
1412	assert property (@(posedge hclk) disable iff (!hresetn)
1413	  htrans == 2'b11 |-> haddr[31:10] == $past(haddr[31:10]));
1414	```
1415	
1416	**Stress cases.** Payload changes during a stall. ack arrives one cycle early or late. Overlapping requests: decide whether each `req` needs its own `ack`. Reset in the middle of an obligation: decide whether `disable iff` should cancel it.
1417	
1418	**Practice.**
1419	
1420	- Q145 SystemVerilog Timeslot Regions, Assertions, and Clocking-Block Sampling
1421	
1422	- Q146 SVA: Analyze a Complex Property
1423	
1424	- Q148 SVA: valid Must Remain High Until ready
1425	
1426	- Q149 SVA: Sequence Assertion - cat Followed by 3 or 4 dogs
1427	
1428	- Q153 SVA: B Toggles 2 Cycles After A Toggles
1429	
1430	- Q154 req => ack Handshake Protocol
1431	
1432	- Q155 AHB-Lite Burst Must Not Cross 1KB Boundary
1433	
1434	- Q157 Simple Fell-Triggered Assertion
1435	
1436	- Q158 Complete req-ack Handshake Suite
1437	
1438	- Q160 req/gnt 4-Way Handshake - Concurrent and always Block
1439	
1440	- Q198 -> vs => - Overlapping vs Non-Overlapping Implication
1441	
1442	- Q286 Credit Release Handshake Checker with SVA
1443	
1444	- Q361 Immediate assertion vs Concurrent Assertion
1445	
1446	---
1447	
1448	## 21. Real-time clock and pulse measurement
1449	
1450	Use this to check pulse width, duty cycle, period, or jitter. The invariant is to measure elapsed time between the relevant edges, because counting cycles cannot see a glitch shorter than a cycle.
1451	
1452	**Interview answer.** "I timestamp edges with `$realtime` and compare the difference with the bound. Same-direction edges give the period, opposite edges give high or low time. I discard the first measurement after reset because it starts from an arbitrary point."
1453	
1454	```systemverilog
1455	realtime t_rise, t_fall;
1456	bit have_rise;
1457	always @(posedge sig) begin
1458	  realtime p;
1459	  p = $realtime - t_rise;
1460	  if (have_rise && (p < EXP*0.95 || p > EXP*1.05))   // 5% tolerance (Q150)
1461	    `uvm_error("PERIOD", $sformatf("period %0t", p))
1462	  t_rise = $realtime; have_rise = 1;
1463	end
1464	always @(negedge sig)
1465	  if (have_rise && ($realtime - t_rise) < 2.5ns)
1466	    `uvm_error("GLITCH", "high pulse shorter than 2.5 ns")
1467	```
1468	
1469	Keep the parentheses around the two bound checks. Without them, `&&` binds tighter than `||` and the first measurement after reset reports a false error.
1470	
1471	**Assertion form (Q147, Q159).**
1472	
1473	```systemverilog
1474	property min_high(realtime min_w);
1475	  realtime t;
1476	  @(posedge sig) (1, t = $realtime) |=> @(negedge sig) ($realtime - t) >= min_w;
1477	endproperty
1478	```
1479	
1480	Use `|=>` here, because the antecedent and consequent use different clocks.
1481	
1482	**Asynchronous change of the expected period (Q151).** Decide which interval uses the old value and which uses the new one, for example by latching the expected period at each measured edge.
1483	
1484	**Clock with jitter or random start (Q89, Q239).**
1485	
1486	```systemverilog
1487	initial begin
1488	  clk = $urandom_range(0, 1);                 // random initial level
1489	  #($urandom_range(0, 1000) * 1ps);           // random start phase
1490	  forever begin
1491	    int j = int'($urandom_range(0, 2*JIT_PS)) - JIT_PS;  // signed jitter
1492	    #(HALF + j * 1ps) clk = ~clk;
1493	  end
1494	end
1495	```
1496	
1497	**Delay of 0 to 1.25 clock periods (Q193).** `#($urandom_range(0, 125) * PERIOD / 100)`, with `timeprecision` fine enough to represent the step.
1498	
1499	**Stress cases.** A pulse shorter than the timescale precision, rounding at the exact bound, and a stale expected period.
1500	
1501	**Practice.**
1502	
1503	- Q89 Clock Module with Randomized Initial State
1504	
1505	- Q147 SVA: Glitch Detection - Signal HIGH for Less Than 2.5 ns
1506	
1507	- Q150 SVA: Clock Period Verification - Within 5% of Expected Period
1508	
1509	- Q151 SVA: Clock Period Check When expected\_clock\_period Is Async
1510	
1511	- Q156 Check Clock Frequency is 100 MHz
1512	
1513	- Q159 Detect Short Glitch Pulses Shorter Than 2.5 ns
1514	
1515	- Q193 Generate a Delay Signal 0-1.25x One Clock Cycle
1516	
1517	- Q236 Clock Period Monitor and Scoreboard (5% Tolerance Check)
1518	
1519	- Q239 Generate Clock in Testbench with Jitter/Variation
1520	
1521	---
1522	
1523	## 22. Process ownership, fork/join, and timeouts
1524	
1525	Use this to start parallel work with a bounded lifetime and safe cleanup. The invariant is that every spawned process has an owner, a completion condition, and a cleanup rule.
1526	
1527	**Interview answer.** "`join` waits for all children, `join_any` for the first, and `join_none` for none. To time out a task, I fork the task and a delay with `join_any`, then `disable fork`. I wrap that in an outer `fork ... join` so `disable fork` kills only these two threads and not unrelated ones started earlier by the same parent."
1528	
1529	```systemverilog
1530	fork
1531	  begin
1532	    fork
1533	      do_work();
1534	      begin
1535	        #TIMEOUT;
1536	        `uvm_error("TIMEOUT", "Operation exceeded latency bound")
1537	      end
1538	    join_any
1539	    disable fork;
1540	  end
1541	join
1542	```
1543	
1544	**Loop variable capture (Q178, Q197).**
1545	
1546	```systemverilog
1547	for (int i = 0; i < 3; i++) begin
1548	  automatic int k = i;   // each thread gets its own copy
1549	  fork
1550	    run(k);
1551	  join_none
1552	end
1553	wait fork;               // wait for all of them
1554	```
1555	
1556	Without `automatic int k`, all three threads see the final value `i == 3`.
1557	
1558	**After any two of three tasks (Q180).** Use a counter or a semaphore: each task increments a shared counter when it finishes, and the parent does `wait (done_cnt >= 2)`.
1559	
1560	**Disable one branch (Q182, Q190).** Name the block (`begin : b2 ... end`) and call `disable b2;`, or keep a `process` handle from `process::self()` and call `p.kill()`.
1561	
1562	**Stress cases.** A killed thread holds a semaphore key or a credit, and `disable fork` does not return it. A task and the timeout finish in the same time step. `wait fork` also waits for threads you did not mean to include.
1563	
1564	**Practice.**
1565	
1566	- Q167 fork...join, join\_any, join\_none, and Safe Cleanup
1567	
1568	- Q178 SV Coding: fork/join\_none Loop Variable Capture
1569	
1570	- Q179 SV Coding: fork/join Variations and wait fork
1571	
1572	- Q180 SV Coding: fork/join - Call Function After Any Two of Three Tasks Complete
1573	
1574	- Q182 Disable Specific Named Fork Branch
1575	
1576	- Q183 fork-join\_any for Task Timeout Detection
1577	
1578	- Q185 Nested fork-join\_any with Delays - Print Order
1579	
1580	- Q186 fork-join / join\_any / join\_none + Watchdog Timer
1581	
1582	- Q190 Named fork-join Disable - Selective Process Killing
1583	
1584	- Q191 fork-join / join\_any / join\_none - Shared Variable Trace
1585	
1586	- Q196 fork-join\_none Tasks with #Delay - Value Trace and Semaphore
1587	
1588	- Q197 fork-join\_none in for Loop - Block Without Affecting Others
1589	
1590	---
1591	
1592	## 23. Handles, copying, and polymorphism
1593	
1594	Use this to trace shared state, virtual dispatch, casting, and ownership. The invariant is that a handle, the object it points to, and that object's real type are three different things.
1595	
1596	**Interview answer.** "A class variable is a handle. Assigning handles shares one object. `copy` or `clone` makes a new object, and nested objects are shared unless `do_copy` copies them too. A `virtual` method dispatches on the object's real type. A non-virtual method dispatches on the handle's declared type. `$cast` checks a downcast at run time and returns 0 on failure."
1597	
1598	```systemverilog
1599	class shape;            virtual function real area(); return 0; endfunction endclass
1600	class circle extends shape;
1601	  real r;
1602	  virtual function real area(); return 3.14159*r*r; endfunction
1603	endclass
1604	
1605	shape s; circle c = new; c.r = 1;
1606	s = c;                         // upcast, always legal
1607	$display(s.area());            // 3.14159: virtual dispatch uses the real type
1608	if (!$cast(c, s)) $error("not a circle");  // downcast, checked at run time
1609	```
1610	
1611	**Method.**
1612	
1613	- Draw handles as arrows to objects.
1614	
1615	- For each call, ask whether the method is virtual, and which class the object really is.
1616	
1617	- Check every `$cast` on a downcast.
1618	
1619	- Separate handle assignment, shallow copy, and deep copy.
1620	
1621	**Pass by value vs ****`ref`**** (Q173).** Passing a handle by value lets the callee modify the object but not make the caller's handle point elsewhere. With `ref`, `h = new` inside the callee changes the caller's handle.
1622	
1623	**Abstract class (Q201).** `virtual class` cannot be instantiated. `pure virtual` methods force every subclass to implement them. Use it for a base driver or base sequence that defines an interface.
1624	
1625	**Singleton (Q170, Q172).** A static handle, a `protected` constructor, and a static `get()` that creates the object on first use.
1626	
1627	**Override vs overload (Q199).** SV supports override (same signature in a subclass), but not overload by argument types as C++ does.
1628	
1629	**Component vs object (Q253).** `uvm_component` is static, has a parent and phases, and exists for the whole simulation. `uvm_object` is dynamic data such as items, sequences, and configs.
1630	
1631	**Stress cases.** Two queue entries point to one mutable object. A copied object still shares a nested object. A downcast fails. A missing `virtual` keyword breaks expected polymorphism.
1632	
1633	**Practice.**
1634	
1635	- Q75 Polymorphism and Inheritance in SystemVerilog/UVM
1636	
1637	- Q169 SystemVerilog cast: Purpose, Dynamic Downcast, and Failure Handling
1638	
1639	- Q170 OOP: Inheritance, Polymorphism, and Singleton Pattern
1640	
1641	- Q171 OOP: UVM Sequence Bug Analysis
1642	
1643	- Q172 OOP: Singleton Class and Abstract Class
1644	
1645	- Q173 SV OOP: Class Handle - Pass by Value vs Pass by ref
1646	
1647	- Q187 ISA Implementation - Struct vs OOP
1648	
1649	- Q192 Polymorphism, Typecasting, and Virtual Functions
1650	
1651	- Q194 Polymorphism and Virtual Functions - Output Trace
1652	
1653	- Q195 OOP - Shape / Circle / Rectangle with Virtual print\_area()
1654	
1655	- Q199 OOP - Override vs Overload (C++ Comparison)
1656	
1657	- Q201 Virtual Class (Abstract Class) - When to Use
1658	
1659	- Q203 C++ Pointer Swap - Ref vs Value, const Pointer vs Pointer to const
1660	
1661	- Q228 virtual function - Purpose and Example
1662	
1663	---
1664	
1665	## 24. FSMs and sequence detectors
1666	
1667	Use this when outputs depend on recent input history. The invariant is that state holds only the history the future needs. For a pattern detector, state means "the longest suffix of the input so far that is also a prefix of the pattern".
1668	
1669	**Interview answer.** "I first ask Mealy or Moore, and overlapping or not. Then I name each state by how much of the pattern matched, build the transition table, and only then write RTL with a state register, next-state logic, and output logic separated. On a mismatch I fall back to the longest matching suffix, not to idle."
1670	
1671	**Method.**
1672	
1673	1. Name each state by its exact meaning.
1674	
1675	2. Build the transition table before RTL.
1676	
1677	3. Separate the state register from combinational next-state and output logic.
1678	
1679	**Example: overlapping 1101 Mealy detector (Q1).**
1680	
1681	| State (matched) | in=0 | in=1 |
1682	| --- | --- | --- |
1683	| S0 "" | S0 | S1 |
1684	| S1 "1" | S0 | S2 |
1685	| S2 "11" | S3 | S2 |
1686	| S3 "110" | S0 | S1, out=1 |
1687	
1688	After a detection on "1101" the last "1" is the start of a new match, so S3 with input 1 goes to S1.
1689	
1690	**Serial divisibility by N (Q48).** Track the remainder of the bits seen so far, most significant bit first:
1691	
1692	$$
1693	r_{next} = (2r + bit_{in}) \bmod N
1694	$$
1695	
1696	For N = 5 that gives five states, one per remainder. If bits arrive least significant first, you also need to track the current power of 2 modulo N.
1697	
1698	**Moore vs Mealy (Q202).** Moore output depends only on state and appears one cycle later but is glitch-free. Mealy output depends on input too, reacts in the same cycle, and needs one fewer state. A shift register detector compares the last N bits directly and costs N flops.
1699	
1700	**Stress cases.** A mismatch that does not mean idle, overlapping patterns, and an input that ends one match while starting another.
1701	
1702	**Practice.**
1703	
1704	- Q1 Overlapping 1101 Mealy Sequence Detector and Verification
1705	
1706	- Q34 Digital Design: FSM for a Digital Lock with RTL and Assertions
1707	
1708	- Q43 Dual Sequence Detector FSM (10111 & 10010)
1709	
1710	- Q47 Sequence Detector Optimization
1711	
1712	- Q48 Serial Divisibility-by-5 FSM
1713	
1714	- Q83 Sequence Detector FSM (1011 Pattern)
1715	
1716	- Q86 Error Window FSM with 64-Cycle Counter
1717	
1718	- Q88 Vending Machine FSM - Requirements and State Design
1719	
1720	- Q202 Sequence Detector 10110 - Moore / Mealy / Shift Register
1721	
1722	---
1723	
1724	## 25. FIFO occupancy, boundaries, depth, and verification
1725	
1726	Use this to design or check buffering. The invariant is to count accepted pushes and pops, not attempted requests.
1727	
1728	**Interview answer.** "Push happens when write is requested and the FIFO is not full, pop when read is requested and it is not empty. Count changes by push minus pop. I check full and empty with simultaneous push and pop, depth 1, and non-power-of-two depth, and I verify against a queue model in the scoreboard."
1729	
1730	```text
1731	push = write_request && !full
1732	pop  = read_request  && !empty
1733	next_count = count + push - pop
1734	```
1735	
1736	**Widths.** A counter from 0 to DEPTH needs `$clog2(DEPTH + 1)` bits, so depth 5 needs 3 bits. An address pointer needs `$clog2(DEPTH)` bits and explicit wrap when DEPTH is not a power of two.
1737	
1738	**Minimum depth (Q84).** Depth must cover the largest backlog: burst length times (1 minus read rate divided by write rate), plus any reader latency. Example: a burst of 80 words written at 100 MHz and read at 50 MHz builds a backlog of 80 x (1 - 50/100) = 40 words.
1739	
1740	**Sync vs async vs circular (Q263).** A synchronous FIFO uses one clock and a counter or pointers. An asynchronous FIFO uses two clocks and Gray-coded pointers (Template 26). "Circular" describes the pointer wrap and applies to both.
1741	
1742	**FIFO test plan (Q269, Q278).** Reset state, fill to full, write when full, drain to empty, read when empty, simultaneous push and pop at full and at empty, back-to-back and random gaps, data integrity against a queue model, and (for async) different clock ratios and reset of one side.
1743	
1744	**Stress cases.** Simultaneous push and pop when full or empty, depth 1, non-power-of-two wrap, and empty flag timing with registered read data (Q64).
1745	
1746	**Practice.**
1747	
1748	- Q4 Parameterized Synchronous FIFO RTL Implementation
1749	
1750	- Q9 RTL Bug Fix: Synchronous FIFO
1751	
1752	- Q31 Digital Design: FIFO Full and Empty Detection
1753	
1754	- Q63 FIFO with Non-Power-of-2 Depth
1755	
1756	- Q64 FIFO Registered Output and Empty Flag Design
1757	
1758	- Q84 Minimum FIFO Depth Calculation
1759	
1760	- Q95 Synchronous FIFO Using SRAM with Counter
1761	
1762	- Q103 APB FIFO Design - RTL Implementation
1763	
1764	- Q263 Async FIFO vs Circular FIFO vs Sync FIFO
1765	
1766	- Q269 Test Plan: Async FIFO Corner Cases & Verification
1767	
1768	- Q278 FIFO Verification - What to Verify, How, Corner Cases
1769	
1770	---
1771	
1772	## 26. CDC and asynchronous FIFO architecture
1773	
1774	Use this when information crosses between unrelated clocks. The invariant is to choose a mechanism that keeps the information correct, not one that merely moves the bits.
1775	
1776	**Interview answer.** "A single stable level goes through a two-flop synchronizer. A pulse from a fast clock needs stretching or a toggle and handshake. A multi-bit value needs a handshake that holds the data stable or an async FIFO. Synchronizing each bit of a bus separately is wrong because bits can land in different cycles. Same frequency with an unknown phase still needs CDC."
1777	
1778	| What crosses | Mechanism |
1779	| --- | --- |
1780	| Stable single-bit level | Two- or three-flop synchronizer |
1781	| Pulse, fast to slow | Toggle or stretch plus synchronizer, or req/ack handshake |
1782	| Multi-bit value | Handshake with stable data, or async FIFO |
1783	| Continuous stream | Dual-clock FIFO |
1784	
1785	**Async FIFO.** Each side keeps a binary pointer for its memory address and a Gray copy for crossing. The Gray pointer passes through a two-flop synchronizer into the other domain. Full is computed in the write domain, empty in the read domain. Gray code works because only one bit changes per increment, so a pointer sampled mid-change is either the old or the new value.
1786	
1787	**Full and empty with N+1-bit Gray pointers.** Empty when the read pointer equals the synchronized write pointer. Full when the top two bits differ and the rest are equal.
1788	
1789	**MTBF (Q5, Q58).**
1790	
1791	$$
1792	MTBF = \frac{e^{t_r/\tau}}{T_0 \, f_{clk} \, f_{data}}
1793	$$
1794	
1795	Adding a flop adds a full cycle of resolution time to t\_r, which raises MTBF exponentially.
1796	
1797	**Constraints (Q46).** Gray-coded pointer bits need a max-delay constraint so they arrive within one destination period of each other, for example `set_max_delay -datapath_only <dest_period> -from [wptr_gray regs] -to [sync stage 1]`. Also declare the clocks asynchronous with `set_clock_groups -asynchronous` for the other paths.
1798	
1799	**Stress cases.** A pulse too short for the receiving clock, events faster than a toggle handshake can carry, independently synchronized bits forming a wrong word, and reset reaching only one side.
1800	
1801	**Practice.**
1802	
1803	- Q5 Setup/Hold, Violations, Two-Flop Synchronizer, and MTBF
1804	
1805	- Q8 CDC: Synchronizer Placement
1806	
1807	- Q10 RTL Bug Fix: Power Manager (CDC + Blocking/Non-blocking)
1808	
1809	- Q46 Async FIFO Gray Code SDC Constraint
1810	
1811	- Q58 2-Stage Synchronizer: Metastability, Design, and Analysis
1812	
1813	- Q59 Gray Code Binary Conversion & CDC Use Case
1814	
1815	- Q60 Async FIFO Data Path Handling
1816	
1817	- Q61 Async FIFO Architecture
1818	
1819	- Q62 Same Frequency, Different Phase - Why CDC Still Needed
1820	
1821	- Q69 CDC Multi-bit Transfer - Why Not 2-FF Synchronizer?
1822	
1823	- Q106 Async FIFO from Scratch - Gray Code Pointer Design
1824	
1825	- Q264 Async FIFO Potential Problems
1826	
1827	---
1828	
1829	## 27. Setup, hold, clock dividers, and clock-path reasoning
1830	
1831	Use this to explain a timing limit or judge a proposed timing fix. The invariant is to draw the launch and capture edges before using any equation.
1832	
1833	**Interview answer.** "Setup checks that data launched on one edge arrives before the next capture edge. Hold checks that new data does not arrive too soon after the same edge. Lowering the clock frequency fixes setup but not hold, because the hold check does not depend on the period."
1834	
1835	With skew defined as capture clock latency minus launch clock latency:
1836	
1837	$$
1838	T_{clk} + T_{skew} \ge T_{cq,max} + T_{comb,max} + T_{setup} + T_{uncertainty}
1839	$$
1840	
1841	$$
1842	T_{cq,min} + T_{comb,min} \ge T_{hold} + T_{skew} + T_{uncertainty}
1843	$$
1844	
1845	**Fixes.** Setup: shorten logic, pipeline, use faster cells, useful skew, or lower frequency. Hold: add delay cells on the data path. Positive skew helps setup and hurts hold.
1846	
1847	**Divide by 3 with 50% duty (Q30).**
1848	
1849	```systemverilog
1850	logic [1:0] cnt; logic p, n;
1851	always_ff @(posedge clk or negedge rst_n)
1852	  if (!rst_n) cnt <= 0; else cnt <= (cnt == 2) ? 0 : cnt + 1;
1853	always_ff @(posedge clk or negedge rst_n)
1854	  if (!rst_n) p <= 0; else p <= (cnt == 0);   // high 1 of 3 cycles
1855	always_ff @(negedge clk or negedge rst_n)
1856	  if (!rst_n) n <= 0; else n <= p;            // same pulse, half a cycle later
1857	assign clk_div3 = p | n;                      // high for 1.5 of 3 cycles
1858	```
1859	
1860	Declare the output with `create_generated_clock` (Q50), for example `create_generated_clock -name clk_div3 -source [get_ports clk] -divide_by 3 [get_pins u_or/Y]`.
1861	
1862	**Clock gating (Q78).** A plain AND gate on the clock glitches if enable changes while the clock is high. An integrated clock gate latches enable while the clock is low (a negative-level latch), then ANDs it with the clock, so enable can only change when the AND output is already low.
1863	
1864	**Clock mux glitch (Q100).** `sel ? clk1 : clk2` can produce a runt pulse when `sel` changes. The glitch-free mux uses two enable flops, one per clock, each clocked on its own falling edge, with cross-coupled feedback. One clock's enable turns off before the other turns on.
1865	
1866	**Practice.**
1867	
1868	- Q7 Setup/Hold Time: Concepts, Violations, and Fixes
1869	
1870	- Q30 Divide-by-3 Clock with 50% Duty Cycle
1871	
1872	- Q33 Setup/Hold Timing Analysis and Checker
1873	
1874	- Q41 Clock Divider Progression & Clock Gating
1875	
1876	- Q42 Max Operating Frequency & Hold Violation
1877	
1878	- Q50 create\_generated\_clock SDC
1879	
1880	- Q78 Clock Gating - Basic and ICG with Negative Latch
1881	
1882	- Q100 Clock Mux Glitch - sel ? clk1 : clk2 and Fix
1883	
1884	---
1885	
1886	## 28. RTL coding, resets, and simulation scheduling
1887	
1888	Use this to trace cycle values, avoid latches, and explain races. The invariant is to separate evaluation, state update, and observation.
1889	
1890	**Interview answer.** "I use nonblocking assignments for flops and blocking assignments for combinational logic. Mixing them, or reading a variable from two processes in the same time step, creates races because the order between processes is not defined. Every combinational block gets default assignments so synthesis does not infer a latch."
1891	
1892	**Rules.**
1893	
1894	- Give combinational blocks a default assignment and cover every branch, or synthesis infers a latch (Q67).
1895	
1896	- Use `<=` for clocked state and `=` for combinational logic.
1897	
1898	- `<=` evaluates the right side in Active and updates in NBA. That is why `a <= b; b <= a;` swaps (Q184).
1899	
1900	- Rising-edge detector: register the previous value and output `cur && !prev` (Q110, Q174).
1901	
1902	**Pipeline trace (Q68, Q85).** With blocking `A = in; B = A; C = B;` in one `always @(posedge clk)`, all three get `in` in the same cycle, which is one register. With `<=`, they form a three-stage shift register.
1903	
1904	**Synchronous vs asynchronous reset (Q32).** Synchronous reset needs a running clock, acts only on an edge, and is easy to time. Asynchronous reset works without a clock but must be released synchronously, or flops leave reset in different cycles. The standard fix is a reset synchronizer:
1905	
1906	```systemverilog
1907	always_ff @(posedge clk or negedge arst_n)
1908	  if (!arst_n) {rst_q2, rst_q1} <= 2'b00;
1909	  else         {rst_q2, rst_q1} <= {rst_q1, 1'b1};
1910	assign rst_n_sync = rst_q2;   // asserts immediately, releases on a clock edge
1911	```
1912	
1913	**Task vs function (Q162).**
1914	
1915	|   | function | task |
1916	| --- | --- | --- |
1917	| Consumes time | No | Yes (`#`, `@`, `wait`) |
1918	| Returns | One value, or `void` | Through `output`/`ref` arguments |
1919	| Can call | Functions only (it may start `fork ... join_none`) | Tasks and functions |
1920	| Typical use | Calculations, `write()` callbacks | Driving a bus, waiting for events |
1921	
1922	**Streaming operators (Q165).**
1923	
1924	```systemverilog
1925	logic [7:0]  u [4] = '{8'h11, 8'h22, 8'h33, 8'h44};
1926	logic [3:0][7:0] p;
1927	logic [31:0] f, r, b;
1928	f = {>>{u}};      // 32'h11223344: u[0] goes to the most significant byte
1929	r = {<<8{f}};     // 32'h44332211: reverse the byte order
1930	b = {<<{f}};      // reverse the bit order
1931	f = p;            // a packed 2D array is already one 32-bit vector
1932	```
1933	
1934	**`$display`****, ****`$strobe`****, ****`$monitor`****, ****`$write`**** (Q163).** `$display` prints immediately with a newline. `$write` prints without a newline. `$strobe` prints at the end of the time step, after NBA updates. `$monitor` prints whenever a listed argument changes.
1935	
1936	**`case`****, ****`casez`****, ****`casex`**** (Q164).** `casez` treats `z` and `?` as don't-care. `casex` also treats `x` as don't-care, which can hide X bugs, so prefer `casez` or `case inside`.
1937	
1938	**`timescale 1ns/1ps`**** (Q76).** Delays are in nanoseconds and rounded to 1 ps, so `#1.23456` becomes 1.235 ns. `timescale` carries across files in compile order, so prefer `timeunit` and `timeprecision` in each module or package.
1939	
1940	**Flop with a power check (Q77).** Add a supply-good input and drive `q` to `'x` while supply is off. This is how power-aware simulation shows that state is lost.
1941	
1942	**Practice.**
1943	
1944	- Q32 Digital Design: Synchronous vs Asynchronous Reset - When to Use Each
1945	
1946	- Q40 Verilog Macro Define Inside if-else
1947	
1948	- Q66 Flip-Flop vs Latch
1949	
1950	- Q67 Avoiding Unintended Latches in RTL
1951	
1952	- Q68 Pipeline Waveform - always @(posedge clk) A=en?1:C; B=A; C=B;
1953	
1954	- Q74 Race Condition in Verilog initial Blocks
1955	
1956	- Q76 Timescale Directive - 1ns/1ps
1957	
1958	- Q77 D Flip-Flop RTL with Power Supply Check
1959	
1960	- Q85 Blocking vs NBA Pipeline - A=in, B=A, C=B
1961	
1962	- Q91 Verilog Simulation Scheduling - initial Block Race
1963	
1964	- Q96 Sequential vs Combinational Logic
1965	
1966	- Q104 Race Condition in Verilog - Blocking Assignment in always Block
1967	
1968	- Q105 Verilog/SV Scheduling Regions - Complete Model
1969	
1970	- Q110 req Rising Edge -> One-Cycle flag Pulse
1971	
1972	- Q111 1-bit D Flip-Flop and D Latch - Verilog RTL
1973	
1974	- Q116 1-bit D Flip-Flop Without always Block - Verilog RTL
1975	
1976	- Q161 Blocking vs Nonblocking Assignments and Race Avoidance
1977	
1978	- Q162 SystemVerilog Task vs Function
1979	
1980	- Q163 display, strobe, monitor, and write
1981	
1982	- Q164 case, casez, casex, and Priority Encoders
1983	
1984	- Q165 Streaming Operators and Flattening a 2D Packed Array
1985	
1986	- Q174 SV Coding: Edge Detector (All Edges and Rising Edge)
1987	
1988	- Q181 Verilog: Falling Edge Detector and Its Synthesized Circuit
1989	
1990	- Q184 Blocking vs Non-Blocking Assignment, Swap Without Temp
1991	
1992	- Q189 Mixed Blocking/Nonblocking Cycle-by-Cycle Value Analysis
1993	
1994	---
1995	
1996	## 29. Datapaths, reductions, and arbitration
1997	
1998	Use this to turn arithmetic or arbitration rules into hardware. The invariant is to settle widths, overflow, and selection policy before optimizing structure.
1999	
2000	**Interview answer.** "I first decide signedness, result width, and what happens on overflow, saturate or wrap. Then I separate latency from throughput. A balanced tree cuts logic depth from N to log N, and pipelining raises frequency but adds cycles of latency that the testbench must know."
2001	
2002	**Method.**
2003	
2004	- Decide signedness, extension, overflow, and saturation.
2005	
2006	- Separate the latency requirement from the throughput requirement.
2007	
2008	- Compare serial, balanced-tree, and pipelined structures.
2009	
2010	**Fixed-priority arbiter.** `grant = req & ~(req - 1)` isolates the lowest set bit, so bit 0 has highest priority. Logic depth grows with width. For 128 requesters (Q70), use a tree of 4- or 8-bit priority blocks.
2011	
2012	**Locked fixed priority (Q3).** Once a requester wins, keep its grant until it drops its request, even if a higher priority request arrives.
2013	
2014	**Round-robin.** Keep a rotating priority pointer and move it past the last winner after each accepted grant.
2015	
2016	**Saturating ****`a*b + c`**** (Q45).** Compute at full width (2N+1 bits), compare with the max and min of the output type, and clamp.
2017	
2018	**Carry-select adder (Q115).** Compute each upper block twice, assuming carry-in 0 and 1, and pick one with the real carry. Delay drops from N full-adder stages to one block plus a chain of muxes, at roughly double the area.
2019	
2020	**Sliding window count of ones (Q28).** Keep a running count. Add the entering bit and subtract the leaving bit each cycle, using a shift register of width W.
2021	
2022	**Practice.**
2023	
2024	- Q3 Four-Request Locked Fixed-Priority Arbiter
2025	
2026	- Q18 Parity Check: 16-bit Data Implementation and Gate Layers
2027	
2028	- Q28 Sliding Window: Count 1s in a Parameterized Window
2029	
2030	- Q44 4-Input 1024-bit Sorting Network with CAS
2031	
2032	- Q45 Saturating PE Unit a\*b+c
2033	
2034	- Q53 Two-Stage Pipeline ac + bc with Power Optimization
2035	
2036	- Q70 128-bit Priority Arbiter with Logic Depth Analysis
2037	
2038	- Q79 Voting Machine - 3 Judges + Super Judge Veto
2039	
2040	- Q92 Hardware Optimization - Loop Unrolling, Pipelining, Tiling, Array Partitioning
2041	
2042	- Q98 4-bit Counter with Hold at 3, 6, 9
2043	
2044	- Q108 Data Activity Monitor - RTL and Verification
2045	
2046	- Q109 4-Input Comparator from 2-Input Comparators
2047	
2048	- Q115 Carry-Select Adder: Design and Timing Analysis
2049	
2050	---
2051	
2052	## 30. Gate puzzles, number formats, and arithmetic tricks
2053	
2054	Use this for short logic puzzles and number-representation questions. The invariant is to write the truth table or the bit format first, then derive.
2055	
2056	**Interview answer.** "A 2-to-1 mux computes `s ? i1 : i0`, so tying inputs to constants or to other signals makes any 2-input gate. NAND is universal, and a mux from NAND takes four gates."
2057	
2058	**Gates from a 2-to-1 mux, ****`y = s ? i1 : i0`**** (Q73, Q101).**
2059	
2060	| Gate | s | i1 | i0 |
2061	| --- | --- | --- | --- |
2062	| NOT a | a | 0 | 1 |
2063	| a AND b | a | b | 0 |
2064	| a OR b | a | 1 | b |
2065	| a XOR b | a | \~b | b |
2066	| a NAND b | a | \~b | 1 (needs a second mux for \~b) |
2067	
2068	**2-to-1 mux from NAND only (Q27).** Four gates: `ns = NAND(s,s); t0 = NAND(i0,ns); t1 = NAND(i1,s); y = NAND(t0,t1)`. A 4-to-1 mux takes three 2-to-1 muxes in two levels (Q188). In RTL, write it as a `case` on the select, a nested `?:`, or an indexed vector `y = in[sel]` (Q112).
2069	
2070	**Inverter from unknown gates X and Y (Q19).** Write each gate's truth table, then look for a way to tie inputs together or to a constant that leaves a one-input function equal to NOT.
2071	
2072	**Two's complement width of A - B (Q29).** Two N-bit signed operands need N+1 bits. For unsigned operands with a possibly negative result, zero-extend both and subtract in N+1 signed bits: `$signed({1'b0,a}) - $signed({1'b0,b})`.
2073	
2074	**Gray code (Q2).** Binary to Gray: `g = b ^ (b >> 1)`. Gray to binary: `b[i] = ^g[N-1:i]`. Transition checker:
2075	
2076	```systemverilog
2077	assert property (@(posedge clk) disable iff (!rst_n)
2078	  g != $past(g) |-> $onehot(g ^ $past(g)));
2079	```
2080	
2081	**Booth multiplication (Q52).** Radix 2 looks at bits (q0, q-1): 01 adds M, 10 subtracts M, 00 and 11 do nothing, then shift right arithmetically. Radix 4 looks at three bits and selects 0, plus or minus M, or plus or minus 2M, which halves the number of partial products.
2082	
2083	**4x4 array multiplier (Q55).** 16 AND gates for partial products. An unsigned N x N array uses N(N-2) full adders and N half adders, so 8 full adders and 4 half adders for N = 4.
2084	
2085	**IEEE 754 single precision (Q93).** 1 sign bit, 8 exponent bits with bias 127, 23 fraction bits with a hidden leading 1. Exponent 0 means zero or subnormal. Exponent 255 means infinity (fraction 0) or NaN. Default rounding is round to nearest, ties to even. Edge cases to test: +0 equals -0, NaN is not equal to itself, overflow to infinity, underflow to subnormal.
2086	
2087	**Fibonacci in RTL (Q20).** Two registers: `a <= b; b <= a + b;`. Size them for the largest term you need, or flag overflow.
2088	
2089	**Waveform from NOR plus two flops (Q21).** Write each flop's D input as a function of the current Q outputs, start from the reset values, and fill in a table one clock at a time.
2090	
2091	**Practice.**
2092	
2093	- Q2 Parameterized Gray-Code Transition Checker
2094	
2095	- Q19 Digital Design: Build an Inverter Using Gates X and Y
2096	
2097	- Q20 Verilog: Implement Fibonacci Sequence
2098	
2099	- Q21 Digital Design: NOR + Two D-FFs Circuit Waveform
2100	
2101	- Q27 Digital Design: 2-to-1 MUX Using Only NAND Gates
2102	
2103	- Q29 Digital Design: 2s Complement Bit Width for A-B
2104	
2105	- Q52 Booth Algorithm for Multiplication
2106	
2107	- Q55 4-bit x 4-bit Array Multiplier FA/HA Count
2108	
2109	- Q73 Implement AND Gate Using 2-to-1 MUX
2110	
2111	- Q93 IEEE 754 Floating Point - Format, Operations, Edge Cases
2112	
2113	- Q101 Implement NAND Gate Using 2-to-1 MUX
2114	
2115	- Q112 4-to-1 Multiplexer - Verilog RTL (Multiple Styles)
2116	
2117	- Q188 2-to-1 MUX and 4-to-1 MUX Implementation
2118	
2119	---
2120	
2121	## 31. Low power, safety, security, and memories
2122	
2123	Use this for power-management, UPF, safety, and SRAM questions. The invariant is that every power-down and power-up step has a defined order, and verification must show that no corrupted value leaks out of a domain that is off.
2124	
2125	**Interview answer.** "Dynamic power is alpha times C times V squared times f, so lowering voltage helps most. Clock gating cuts switching, multi-Vt and power gating cut leakage. Power gating needs isolation on the outputs of the off domain, retention for state you must keep, and a defined sequence. In power-aware simulation the off domain goes to X, and I check that isolation clamps keep that X from reaching the always-on logic."
2126	
2127	$$
2128	P_{dyn} = \alpha \, C \, V^2 f
2129	$$
2130	
2131	| Technique | Saves | What to verify |
2132	| --- | --- | --- |
2133	| Clock gating | Dynamic | No glitches, enable timing, same function with gating on and off |
2134	| Operand isolation | Dynamic | Idle datapath inputs held constant |
2135	| Multi-Vt cells | Leakage | Timing only, no functional change |
2136	| Power gating | Leakage | Isolation clamps, retention save and restore, reset on power-up, no X leakage |
2137	| Multiple voltages | Dynamic | Level shifters on every crossing |
2138	| DVFS | Both | Raise V before f when speeding up; lower f before V when slowing down |
2139	
2140	**Typical power-gating order.** Down: stop clocks, enable isolation, save retention, switch off. Up: switch on and wait for stable supply, restore retention, release reset, disable isolation, start clocks.
2141	
2142	**UPF sketch (Q97).**
2143	
2144	```tcl
2145	create_power_domain PD_CORE -elements {u_core}
2146	create_supply_net VDD_CORE
2147	set_isolation iso_core -domain PD_CORE -applies_to outputs \
2148	    -clamp_value 0 -isolation_signal iso_en -isolation_sense high
2149	set_retention ret_core -domain PD_CORE \
2150	    -save_signal {save high} -restore_signal {restore high}
2151	```
2152	
2153	**Safety-aware design (Q11, Q14).** Parity or ECC on storage and buses, duplicated or triplicated logic with voting, watchdogs, and a defined safe state. Lockstep runs two copies of a core, often a couple of cycles apart, and compares outputs every cycle. That roughly doubles core area and power and adds a comparator.
2154	
2155	**Security-aware design (Q12).** Lock bits that block writes after boot, no debug backdoors in production, clearing secrets on reset and on mode change, FSMs that recover from illegal states, and constant-time behavior for operations on secrets.
2156	
2157	**SRAM (Q49, Q94, Q54).** A single-port SRAM does one read or write per cycle. A dual-port SRAM does two, at more area. SRAM arrays have no reset because adding reset to every bit costs too much area, so software or BIST initializes them, and the testbench must not read before writing. For power, split a large memory into banks and enable only the bank you access, because shorter bitlines cost less energy per access.
2158	
2159	**Practice.**
2160	
2161	- Q11 Safety-Aware RTL Design: Techniques and Applications
2162	
2163	- Q12 Security-Aware RTL Design: Techniques and Applications
2164	
2165	- Q13 Low Power RTL Design: Common Techniques and Applications
2166	
2167	- Q14 Lockstep RISC-V: Implementation and Power Impact
2168	
2169	- Q15 Low Power Techniques Overview
2170	
2171	- Q16 Multi-Voltage Domain and DVFS Design Details
2172	
2173	- Q49 Single-Port vs Dual-Port SRAM Interface
2174	
2175	- Q54 SRAM Configuration Power Analysis
2176	
2177	- Q94 SRAM RTL Implementation and Why No Reset
2178	
2179	- Q97 UPF - Unified Power Format, Flow, and X Propagation
2180	
2181	---
2182	
2183	## 32. Software algorithms, windows, and streaming
2184	
2185	Use this to choose a data structure for a coding or log-processing question. The invariant is that the stored state must support exactly the queries and updates the problem asks for.
2186	
2187	**Interview answer.** "I ask about input size, memory limit, duplicates, and ties first. Then I pick the structure from the operations: a hash map for lookup and counting, a sliding window for contiguous ranges, a heap for top-K, sorting for intervals. I say the time and space complexity before I code."
2188	
2189	| Requirement | Method | Questions |
2190	| --- | --- | --- |
2191	| Lookup, counting, uniqueness | Hash map or set | Q299, Q304, Q305, Q328, Q334, Q340 |
2192	| Fixed-length rolling sum | Subtract leaving value, add entering value | Q324 |
2193	| Longest valid substring | Sliding window with a maintained condition | Q317, Q335 |
2194	| Maximum subarray | Kadane: best ending here, best overall | Q332 |
2195	| K smallest, kth smallest | Max-heap of size K | Q341, Q325 |
2196	| Interval merge | Sort by start, merge overlaps | Q314, Q320, Q322 |
2197	| Pair from both ends | Two pointers | Q306, Q310, Q336 |
2198	| Grid diagonals | Group cells by i + j (or i - j) | Q312 |
2199	| Parse and filter logs | Split, regex, bounded buffers | Q223, Q298, Q301, Q330, Q338, Q339 |
2200	| Try every split point | Brute force over positions, O(n^2) | Q311 |
2201	
2202	**Python one-liners interviewers expect.**
2203	
2204	```python
2205	names = [s.strip() for s in line.split(",") if s.strip()]          # Q223
2206	errors = [l for l in open(path) if re.search(r"\bERROR\b", l)]     # Q301
2207	no_vowels = "".join(c for c in s if c.lower() not in "aeiou")      # Q337
2208	by_value = sorted(d.items(), key=lambda kv: kv[1])                 # Q338
2209	```
2210	
2211	**Elevator cargo (Q336).** If each trip carries at most two items, sort and pair the heaviest remaining item with the lightest that fits, using two pointers. If a trip can carry any number of items, it is bin packing, which has no greedy optimum, so ask for the constraints.
2212	
2213	**Tournament bracket (Q326).** Simulate rounds with a queue. A single-elimination bracket with n players always has n - 1 matches.
2214	
2215	**Stress cases.** Repeated keys, all-negative arrays (Kadane must still return the largest single value), an input larger than memory, ties at K, and mixing up kth smallest with kth largest.
2216	
2217	**Practice.**
2218	
2219	- Q223 Python: Parse comma-separated names into a list
2220	
2221	- Q298 Streaming Log Analyzer
2222	
2223	- Q299 Cross-Array Two-Sum Index Pairs
2224	
2225	- Q301 Python: Extract error lines using regex
2226	
2227	- Q304 C++ Algorithm: Count Pairs with Equal Digit Sum
2228	
2229	- Q305 C++ Design: Container with ADD, EXISTS, GET\_COUNT
2230	
2231	- Q306 C++ Algorithm: Palindrome Vowel Removal
2232	
2233	- Q307 C++ Algorithm: Array Pair Product Query with Point Update
2234	
2235	- Q310 Pairing Letters from Both Ends
2236	
2237	- Q311 Minimize Result by Adding Parentheses to Expression
2238	
2239	- Q312 Robot Matrix Diagonal Traversal
2240	
2241	- Q313 Rectangle Storage Queries
2242	
2243	- Q314 Online Interval Merge with Streaming Input
2244	
2245	- Q315 Event ID Check Queue
2246	
2247	- Q316 Count Digits 0, 2, 4 in Range \[0, n]
2248	
2249	- Q317 Longest Contiguous Same-Character Substring
2250	
2251	- Q318 Place Lamp to Illuminate Maximum Objects
2252	
2253	- Q319 Cyclic Shift Validation
2254	
2255	- Q320 Memory Allocator Simulation
2256	
2257	- Q321 Byte Stream Chunk Merging
2258	
2259	- Q322 Merge Intervals and Return All Unique Numbers
2260	
2261	- Q323 Clock Chain Parameter Search
2262	
2263	- Q324 Sliding Window Maximum Sum and Starting Index
2264	
2265	- Q325 Index of Second Smallest Element
2266	
2267	- Q326 Tournament Elimination Bracket
2268	
2269	- Q328 Array Deduplication - O(n^2) to O(n) Optimization
2270	
2271	- Q330 Parse Mixed UVM/Custom Simulation Log File
2272	
2273	- Q332 Maximum Subarray Sum with Subset Tracking (Kadane's)
2274	
2275	- Q334 Longest Consecutive Sequence (LC 128)
2276	
2277	- Q335 Longest Substring Without Duplicates (C++)
2278	
2279	- Q336 Elevator Cargo - Minimum Trips with Weight Limit
2280	
2281	- Q337 Python - Remove Vowels / Remove Consonants from String
2282	
2283	- Q338 Sort Python Dictionary by Value; Regex Match Two Strings
2284	
2285	- Q339 Sort Log File by Age and Write to Output
2286	
2287	- Q340 Python - Find Unpaired Numbers in a List
2288	
2289	- Q341 Find the 3rd Smallest Value in an Integer Stream
2290	
2291	---
2292	
2293	## 33. Bit manipulation and in-place operations
2294	
2295	Use this for bit tricks and in-place sequence updates. The invariant is to fix width, signedness, and the loop end condition first.
2296	
2297	**Interview answer.** "`x & (x - 1)` clears the lowest set bit, so a power of two is a positive number where that gives zero, and popcount is how many times you can do it before reaching zero."
2298	
2299	```c
2300	bool is_pow2(unsigned x)   { return x && !(x & (x - 1)); }           // Q331
2301	int  popcount(unsigned x)  { int n = 0; while (x) { x &= x - 1; n++; } return n; }  // Q333
2302	bool bit_set(unsigned x, int n) { return (x >> n) & 1u; }            // Q302
2303	unsigned set_bit(unsigned x, int n)   { return x |  (1u << n); }     // Q87
2304	unsigned clear_bit(unsigned x, int n) { return x & ~(1u << n); }     // Q87
2305	int single(int *a, int n) { int r = 0; for (int i = 0; i < n; i++) r ^= a[i]; return r; } // Q303
2306	```
2307	
2308	**Reverse 32 bits (Q300).** Loop 32 times: `r = (r << 1) | (x & 1); x >>= 1;`. Or swap halves, then bytes, nibbles, pairs, and single bits with masks.
2309	
2310	**Reverse a linked list (Q308).** Three pointers: `prev = NULL; while (cur) { next = cur->next; cur->next = prev; prev = cur; cur = next; } return prev;`
2311	
2312	**Move zeros to end (Q327).** A write index copies each non-zero forward, then fills the rest with zeros. This keeps order and runs in O(n).
2313	
2314	**`memcpy`**** safety (Q309).** Overlapping buffers need `memmove`. Check sizes against the destination, not the source. Watch for null pointers and integer overflow in the length.
2315	
2316	**Fibonacci (Q329).** Naive recursion is O(2^n). Iteration or memoization is O(n).
2317	
2318	**Stress cases.** Zero, shifting by the full width (undefined in C), sign extension on right shift of signed values, and empty lists.
2319	
2320	**Practice.**
2321	
2322	- Q87 C++ Bit Manipulation - Set/Clear Nth Bit
2323	
2324	- Q200 Bit-Field Extraction and Variable Bit Selection
2325	
2326	- Q300 Reverse a 32-Bit Unsigned Integer
2327	
2328	- Q302 C: Check if the N-th bit is 1
2329	
2330	- Q303 Algorithm: Find the Element That Appears Once (XOR Trick)
2331	
2332	- Q308 Reverse a Linked List
2333	
2334	- Q309 C: memcpy Safety Issues and Best Practices
2335	
2336	- Q327 Move Zeros to End (LC 283)
2337	
2338	- Q329 Fibonacci: Recursive vs Iterative, Complexity, and Sequence Output
2339	
2340	- Q331 Check if a Number Is a Power of 2 (Bit Manipulation)
2341	
2342	- Q333 Count Number of 1 Bits in Binary (Popcount)
2343	
2344	---
2345	
2346	## 34. Caches, coherence, pipelines, and interrupts
2347	
2348	Use this to walk address mapping, cache ownership, or pipeline hazards. The invariant is to state the cache geometry, who owns the latest data, and the ordering model before walking a trace.
2349	
2350	**Interview answer.** "I split the address into tag, index, and offset from the cache geometry. For coherence I track each core's line state. In MESI a write needs the line in M or E, so other copies must be invalidated first. MOESI adds O, which lets a dirty line be shared without writing it back to memory first."
2351	
2352	For power-of-two line size and set count:
2353	
2354	$$
2355	offsetBits = \log_2(lineSize)
2356	$$
2357	
2358	$$
2359	indexBits = \log_2(numberOfSets), \quad numberOfSets = \frac{cacheSize}{lineSize \times ways}
2360	$$
2361	
2362	$$
2363	tagBits = addressWidth - indexBits - offsetBits
2364	$$
2365	
2366	**Worked case (Q113).** 32KB, 4-way, 32-byte lines, 32-bit address: 32768 / (32 x 4) = 256 sets. Offset 5 bits, index 8 bits, tag 19 bits.
2367	
2368	**MESI and MOESI (Q23, Q38, Q51).** M: dirty, only copy. E: clean, only copy. S: clean, possibly shared. I: invalid. O (MOESI): dirty but shared, and this cache supplies the data. When two processors write the same line, one wins ownership and the other's copy is invalidated, then the second write takes ownership in turn.
2369	
2370	**Hazards (Q6).** RAW is a true dependency, solved by forwarding or a stall. A load followed by a use still stalls one cycle in a classic 5-stage pipeline. WAR and WAW appear only with out-of-order execution and are solved by register renaming.
2371	
2372	**Out-of-order (Q35, Q36, Q37).** The reorder buffer commits in program order so exceptions stay precise. The register alias table maps architectural registers to physical ones. A checkpoint (CFC) copy of the table restores it after a mispredicted branch.
2373	
2374	**Replacement (Q17).** True LRU over 16 ways needs a full order. Tree PLRU needs 15 bits per set, one per tree node, flipped away from the accessed way.
2375	
2376	**Write-back vs write-through (Q24).** Write-back writes memory only on eviction of a dirty line. Write-through writes memory on every store.
2377	
2378	**Interrupts (Q90).** An interrupt is an asynchronous signal asking the CPU for service. The CPU finishes the current instruction, saves context, jumps to the handler, the handler clears the source (often a write-1-to-clear bit), and the CPU returns. Ask about level vs edge, masking, and priority.
2379	
2380	**Jump immediate vs jump register (Q99).** Jump immediate encodes the target in the instruction. Jump register reads it from a register, which makes function returns and computed jumps possible.
2381	
2382	**Practice.**
2383	
2384	- Q6 Five-Stage Pipeline RAW, WAR, WAW, Forwarding, and Stalls
2385	
2386	- Q17 LRU and PLRU Cache Replacement: 16-Way Implementation
2387	
2388	- Q23 Computer Architecture: MOESI Protocol - Two Processors Writing Same Cache Line
2389	
2390	- Q24 Computer Architecture: Cache Types and Write-Back Policy
2391	
2392	- Q35 Computer Architecture: ROB and CFC - Out-of-Order Execute with In-Order Commit
2393	
2394	- Q36 Computer Architecture: Two Kinds of RAT and What They Solve
2395	
2396	- Q37 Computer Architecture: Purpose of CFC in Tomasulo Machine
2397	
2398	- Q38 Computer Architecture: MOESI vs MESI - The O State and Performance
2399	
2400	- Q39 Computer Architecture: MOESI State Transition Table for 4-Core CMP
2401	
2402	- Q51 MSI / MESI / MOESI Cache Coherence Protocols
2403	
2404	- Q71 Cache - CPU Write, Set Mapping, PLRU
2405	
2406	- Q90 What is an Interrupt?
2407	
2408	- Q99 Jump Immediate vs Jump Register (ISA)
2409	
2410	- Q102 Pipeline Hazards and Cache Mapping
2411	
2412	- Q113 Cache Address Structure - 32KB 4-Way 32B Cacheline
2413	
2414	---
2415	
2416	## 35. Transistor-level circuit analysis
2417	
2418	Use this for device operating regions and CMOS networks. The invariant is to decide each transistor's operating region before you apply an equation.
2419	
2420	**Interview answer.** "For a CMOS gate, the NMOS network pulls down and the PMOS network pulls up, and they are duals. A NAND has NMOS in series because the output goes low only when all inputs are high, and PMOS in parallel because any low input pulls it high. Series NMOS are made wider to keep pull-down strength equal to the inverter."
2421	
2422	**Method.**
2423	
2424	1. Find Vgs and Vds for each device.
2425	
2426	2. Check threshold voltage and body effect.
2427	
2428	3. Analyze pull-up and pull-down paths, switching threshold, and noise margins.
2429	
2430	4. Add parasitic capacitance, charge sharing, and leakage where they matter.
2431	
2432	**NAND2 sizing (Q350).** If the reference inverter has NMOS width 1 and PMOS width 2, a NAND2 uses NMOS width 2 each (two in series) and PMOS width 2 each (in parallel, worst case one on).
2433	
2434	**Latch-up (Q56).** A parasitic PNPN thyristor between the wells turns on and shorts supply to ground. Prevent it with well taps, guard rings, and spacing.
2435	
2436	**Electromigration (Q355).** Black's equation gives mean time to failure `MTTF = A * J^-n * exp(Ea/kT)`. Use average current for DC wear-out and RMS current for self-heating.
2437	
2438	**RC low-pass filter (Q26, Q356).**
2439	
2440	$$
2441	H(s) = \frac{1}{1 + sRC}, \qquad f_c = \frac{1}{2\pi RC}
2442	$$
2443	
2444	At f\_c the gain is -3 dB and the phase is -45 degrees. Above f\_c the gain falls 20 dB per decade. The step response is `V(1 - e^(-t/RC))`. Example: R = 1 kOhm and C = 1 uF give f\_c of about 159 Hz.
2445	
2446	**Stress cases.** A device you assumed saturated is in the linear region. Charge sharing changes a dynamic node. Leakage breaks an ideal static assumption.
2447	
2448	**Practice.**
2449	
2450	- Q25 Analog/Digital: CMOS Inverter with PMOS and NMOS
2451	
2452	- Q26 Analog Circuit: RC Low-Pass Filter
2453	
2454	- Q56 Latchup Effect in CMOS
2455	
2456	- Q57 Tristate Buffer Circuit and Applications
2457	
2458	- Q80 NAND Gate - CMOS, Stick Diagram, EM
2459	
2460	- Q81 CMOS DFF (Master-Slave Latch) with Tri-State Buffer
2461	
2462	- Q82 What Does This Circuit Do?
2463	
2464	- Q107 NAND2 Schematic - Why NMOS Series, PMOS Parallel
2465	
2466	- Q342 Stacked NMOS Current Mirror Analysis
2467	
2468	- Q343 CMOS Inverter Vin-Vout Transfer Curve, Cascaded Stages
2469	
2470	- Q344 NMOS Pass-Gate Chain with Threshold Compensation
2471	
2472	- Q345 Ring Oscillator and Single Inverter Feedback
2473	
2474	- Q346 Pulse Latch - Pulse Generator Circuit
2475	
2476	- Q347 Logical Effort - FO3, Sizing, F=GH
2477	
2478	- Q348 Circuit Optimization Techniques
2479	
2480	- Q349 Two-Stage Inverter VDDh->VDDl vs VDDl->VDDh
2481	
2482	- Q350 NAND2 Sizing from Corresponding Inverter
2483	
2484	- Q351 Master-Slave DFF - Component Purpose and Removal Analysis
2485	
2486	- Q352 tsu, tc2q Measurement in SPICE; tcq vs tdc Plot
2487	
2488	- Q353 6T SRAM Operation, SNM, and Sizing
2489	
2490	- Q354 ROM Types and Sense Amplifier; Timing Order
2491	
2492	- Q355 Electromigration - DC, AC, Iavg, Irms, Black's Equation
2493	
2494	- Q356 RC Low-Pass Filter - Transfer Function and Cutoff Frequency
2495	
2496	---
2497	
2498	## 36. Behavioral stories and analytical puzzles
2499	
2500	Use this to show your own judgment, or to reason under limited observations. A story shows decisions you made, with evidence. A puzzle answer removes possibilities under stated rules.
2501	
2502	**Interview answer for a story.** Use this order: the context, your responsibility, the options you saw, the trade-off you chose, the result with a number, and what you would do differently.
2503	
2504	**Debug story (Q359).** Pick a real bug. Explain the symptom, how you found the first point of divergence (Template 16), the root cause, the fix, and the regression test you added.
2505	
2506	**Proudest project (Q358).** Pick one where you personally made a design decision. Quantify the outcome: bugs found, coverage reached, regression time saved.
2507	
2508	**Lighter stone among 9 (Q360).** Split into three groups of 3 and weigh two groups. If they balance, the light stone is in the third group. Then weigh 1 against 1 from the light group, and the same logic finds it. Two weighings in total. First ask whether you know the odd stone is lighter, because an unknown direction changes the method.
2509	
2510	**100 switches (Q260).** On pass k, toggle every kth switch. Switch n is toggled once for each divisor of n. Divisors come in pairs except for perfect squares, so only perfect squares have an odd count and end ON. That leaves 10 switches on: 1, 4, 9, ..., 100.
2511	
2512	**Practice.**
2513	
2514	- Q260 100 Switches Toggle Problem
2515	
2516	- Q358 Behavior Question: Describe Your Most Proud Project
2517	
2518	- Q359 Behavior Question: Describe an Interesting Bug You Encountered
2519	
2520	- Q360 Find the Lighter Stone Among 9 (Balance Scale)
2521	
2522	---
2523	
2524	## Before the interview
2525	
2526	**Practice each template without notes.** Say its contract and invariant, sketch the code or data structure, name the assumptions, give two adaptations, walk one normal trace and one counterexample, and explain which check catches the counterexample.
2527	
2528	**Compile the APB example** (Templates 06 to 13) on a simulator and run the validation list in Template 13. Then you can say "I have run this" in the interview.
2529	
2530	**Coverage of the question bank.** Every entry from Q1 to Q361 appears in exactly one Practice list, except Q296, whose source image was unreadable. Several entries are mapped from their title alone, because the bank omits the full problem statements, so read each prompt before you rely on its template.
2531	
2532	**References.** Accellera UVM 1.2 User's Guide and Class Reference, Arm IHI 0024D (APB), Arm IHI 0022 (AXI), Arm IHI 0033 (AHB), IEEE 1800-2017 (SystemVerilog), IEEE 1801 (UPF).
