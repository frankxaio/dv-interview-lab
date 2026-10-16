card "Design Verification interview question bank | Hardware Interview" [97744a20-a1ae-41ff-8f88-4b96d875dc7c] 1350 lines
--- Databases ---
- tag "clipper" [952b4c12-6872-4764-82fe-545db6267cb4]
1	# Design Verification interview question bank | Hardware Interview
2	
3	Source: https://www.hardware-interview.com/study
4	Captured: 2026-10-13
5	Type: Interview study notes / curated question index
6	Topics: Design Verification, SystemVerilog, UVM, constrained random, testbench architecture, CDC, AXI
7	Note: This is an organized, paraphrased study index, not a full copy of the webpage. Visit the source for original question wording, code snippets, and revealed solutions. Employer labels are claims on the source website, not independently verified.
8	
9	Answer guide added 2026-10-13. The 25 constraint examples passed slang syntax and semantic checks, but have not been simulated. Snippets are independent; packet, bus\_if, and work() represent your testbench definitions. Broad prompts state example assumptions.
10	
11	+ ## Verification methodology and test planning
12	
13	  - Plan black-box verification of a memory. Include address boundaries, read/write ordering, simultaneous operations, reset, and a reference model.
14	
15	    **Answer. **I would first define the memory contract: depth, width, request acceptance, read latency, byte enables, reset behavior, and the result of a read and write to the same address. My scoreboard keeps an independent address-to-data model and updates it only on accepted writes. It predicts each accepted read using the specified ordering and compares the response at its expected time. For uninitialized locations, I track whether the contents are defined rather than inventing an expected zero.
16	
17	    Tests cover first/last addresses, every address bit, walking ones/zeros, all-zero/all-one/checkerboard data, back-to-back accesses, write-read-write ordering, byte masks, simultaneous port accesses, stalls, and reset with requests in flight. Assertions check acceptance and response counts, latency, stable stalled responses, and illegal accesses. Coverage crosses operation, address region, masks, collisions, and reset timing. Reset clears contents only if the specification says so.
18	
19	  - Verify fairness and correct grants in a round-robin arbiter, including persistent requests and contention.
20	
21	    **Answer. **I model the round-robin priority pointer and compare every actual grant against the expected eligible winner. I check that grants are one-hot-or-zero, that a grant corresponds to a request, and that the pointer advances on the specified service event. If the winner stalls, the grant must remain stable when the interface requires it. An idle cycle must preserve or reset priority exactly as specified.
22	
23	    For fairness, hold all requests active and check that each requester is served within N accepted service opportunities for an N-way arbiter. A cycle bound requires a separate assumption that service can complete within a bounded time. Test single requests, every contention combination, newly arriving requests, withdrawn requests, pointer wraparound, reset, and long backpressure. Fixed priority can starve a low-priority requester; round-robin fairness depends on eligible requests and service progress.
24	
25	  - Build a FIFO verification plan. Test reset, empty/full, simultaneous push/pop, wraparound, overflow/underflow, and data order.
26	
27	    **Answer. **I use a queue reference model. Each accepted push appends data and each accepted pop removes and compares the oldest item. The occupancy changes by accepted\_push minus accepted\_pop. The model must follow the specified full/empty and simultaneous push/pop policy, including whether a full FIFO can accept a replacement push when a pop succeeds and whether an empty FIFO supports bypass.
28	
29	    Test reset, one element, fill to full, drain to empty, repeated pointer wraparound, push/pop together at every occupancy, overflow/underflow attempts, and distinct data patterns. Check no loss, duplication, or reordering; flag accuracy; blocked operations; output stability; and read latency. Cross occupancy boundary, operation combination, stalls, and reset. For an asynchronous FIFO, also vary independent clocks, clock phase, stopped clocks, and reset sequencing.
30	
31	+ ## UVM interview questions
32	
33	  - Explain the UVM factory and compare factory-based create() against direct new().
34	
35	    **Answer. **The UVM factory creates registered objects and components and applies overrides at creation time. type\_id::create() asks the factory which implementation to instantiate; new() calls the named class constructor directly. I use create() for replaceable verification components and transactions, and new() for helper objects whose exact type is intentional.
36	
37	    ```systemverilog
38	    // packet uses `uvm_object_utils(packet).
39	    packet p = packet::type_id::create("p");
40	    // driver uses `uvm_component_utils(driver).
41	    drv = driver::type_id::create("drv", this);
42	    // Direct construction bypasses factory overrides.
43	    p = new("p");
44	    ```
45	
46	    Register the replacement and set the override before creation. create() does not modify objects that already exist. Reference: [UVM factory reference](https://github.com/accellera-official/uvm-core/blob/main/src/base/uvm_factory.svh)
47	
48	  - Distinguish type overrides from instance overrides.
49	
50	    **Answer. **A type override replaces requests for a registered base type wherever they match. An instance override replaces that type only at a matching creation path. A matching instance override takes precedence over a type override. The replacement should extend the requested class so callers can use the same interface.
51	
52	    ```systemverilog
53	    base_driver::type_id::set_type_override(error_driver::get_type());
54	    base_driver::type_id::set_inst_override(
55	      error_driver::get_type(), "uvm_test_top.env.agent0.drv");
56	    ```
57	
58	    For components, the instance path follows the parent hierarchy and creation name. For objects, a useful path requires an appropriate creation context. Set overrides before create(). Reference: [UVM factory reference](https://github.com/accellera-official/uvm-core/blob/main/src/base/uvm_factory.svh)
59	
60	  - Identify the entry point that starts a UVM test.
61	
62	    **Answer. **The top-level module calls run\_test(). UVM selects and creates the test, then runs the phase schedule. A test name can be supplied explicitly or through +UVM\_TESTNAME=my\_test.
63	
64	    ```systemverilog
65	    module tb;
66	      import uvm_pkg::*;
67	      initial run_test();
68	    endmodule
69	    // Simulation command argument: +UVM_TESTNAME=my_test
70	    ```
71	
72	  - Explain virtual interfaces and how class-based components gain access to DUT signals.
73	
74	    **Answer. **An interface is a statically instantiated container for signals, clocking blocks, and modports. A virtual interface is a handle that lets dynamically created classes access that instance. The top passes the handle through configuration; the driver and monitor retrieve it. A clocking block gives explicit sampling and driving timing to avoid races with RTL. A virtual interface does not create another interface or another copy of its signals.
75	
76	  - Explain a virtual sequencer and when coordinating multiple agents requires one.
77	
78	    **Answer. **A virtual sequencer usually holds handles to the sequencers of several agents. A virtual sequence uses those handles to coordinate traffic such as programming registers before starting data transfers. The virtual sequencer normally has no driver and does not drive pins itself. It is optional. The test can pass agent sequencer handles directly to a virtual sequence and start that sequence on null.
79	
80	  - Classify UVM phases as tasks or functions. Explain the purpose of check\_phase.
81	
82	    **Answer. **build\_phase, connect\_phase, end\_of\_elaboration\_phase, start\_of\_simulation\_phase, extract\_phase, check\_phase, report\_phase, and final\_phase are functions. run\_phase and the runtime subphases are tasks. check\_phase performs final consistency checks such as an empty scoreboard, no outstanding transactions, and no accumulated failures. It cannot wait for a late response; drain traffic during a task phase before checking.
83	
84	    Reference: [UVM phase reference](https://github.com/accellera-official/uvm-core/blob/main/src/base/uvm_common_phases.svh)
85	
86	  - Draw a complete UVM testbench and trace the sequencer-to-driver request and completion protocol. Include test, env, agents, monitor, scoreboard, predictor and optional coverage.
87	
88	    **Answer. **The test configures and starts stimulus. The environment contains agents, a predictor, a scoreboard, and coverage collectors. An active agent contains a sequencer, driver, and monitor; a passive agent has a monitor. The driver converts sequence items into pin activity. Monitors reconstruct accepted bus transactions and publish them through analysis ports. The predictor computes expected results from observed accepted inputs, and the scoreboard compares those results with observed outputs.
89	
90	    ```systemverilog
91	    // Hierarchy and data paths:
92	    // test -> env -> agent -> sequencer, driver, monitor
93	    //                    -> predictor, scoreboard, coverage
94	    // sequence -> sequencer <-> driver -> virtual interface -> DUT
95	    // input monitor -> predictor -> expected FIFO -> scoreboard
96	    // output monitor ----------------> actual FIFO -> scoreboard
97	    // monitor -----------------------> coverage
98	
99	    // agent.connect_phase:
100	    drv.seq_item_port.connect(sqr.seq_item_export);
101	
102	    // Sequence body:
103	    req = item_t::type_id::create("req");
104	    start_item(req);       // Wait for sequencer arbitration.
105	    if (!req.randomize()) `uvm_fatal("RAND", "randomize failed")
106	    finish_item(req);      // Send request and wait for completion.
107	
108	    // Driver run_phase:
109	    forever begin
110	      seq_item_port.get_next_item(req);
111	      drive_request(req);  // Drive until the defined completion event.
112	      seq_item_port.item_done();
113	    end
114	    ```
115	
116	    Pair each get\_next\_item() with exactly one item\_done(). With the alternate get() API, the item handshake completes in get(), so do not also call item\_done(). A driver completion is not necessarily an end-to-end DUT response. The scoreboard tracks that separately. Reference: [UVM sequence reference](https://github.com/accellera-official/uvm-core/blob/main/src/seq/uvm_sequence_base.svh)
117	
118	  - Implement a monitor that collects data while valid is asserted and publishes a completed transaction when valid falls.
119	
120	    **Answer. **Assume a sampled burst consists of data on every clock where valid is 1, and the first sampled valid=0 ends that burst. Allocate a fresh transaction at the start, accumulate its data, and publish it only at the end. Reset aborts a partial burst in this example. The interface clocking block supplies race-free sampling.
121	
122	    ```systemverilog
123	    task run_phase(uvm_phase phase);
124	      packet tr;
125	      bit collecting = 0;
126	      forever begin
127	        @(vif.mon_cb);
128	        if (vif.mon_cb.rst_n !== 1'b1) begin
129	          tr = null;
130	          collecting = 0;
131	        end else if (vif.mon_cb.valid === 1'b1) begin
132	          if (!collecting) begin
133	            tr = packet::type_id::create("tr");
134	            collecting = 1;
135	          end
136	          tr.data.push_back(vif.mon_cb.data);
137	        end else if (vif.mon_cb.valid === 1'b0) begin
138	          if (collecting) begin
139	            ap.write(tr);
140	            tr = null;     // Do not mutate the published object.
141	            collecting = 0;
142	          end
143	        end else begin
144	          `uvm_error("VALID_X", "Unknown valid sampled")
145	        end
146	      end
147	    endtask
148	    ```
149	
150	    packet.data is a queue and ap is a uvm\_analysis\_port#(packet). A valid/ready protocol needs a different collector: collect only on valid && ready and use its framing rule, such as LAST. A valid falling edge is not a general packet boundary in AXI.
151	
152	  - Launch five concurrent threads; once four have finished, terminate the remaining thread.
153	
154	    **Answer. **Use a completion mailbox so simultaneous completions are counted without a shared-counter race. Place the worker fork in its own supervisor process. After four completion tokens arrive, disable fork terminates that supervisor's remaining descendants.
155	
156	    ```systemverilog
157	    task automatic run_five();
158	      mailbox #(int) done = new();
159	      int id;
160	      fork
161	        begin : supervisor
162	          for (int i = 0; i < 5; i++) begin
163	            automatic int k = i;
164	            fork
165	              begin
166	                work(k);       // User-defined automatic task.
167	                done.put(k);
168	              end
169	            join_none
170	          end
171	          repeat (4) done.get(id);
172	          disable fork;
173	        end
174	      join
175	    endtask
176	    ```
177	
178	    A fifth worker may already have finished in the same time slot; then no worker remains to kill. Killing a process does not automatically release semaphores or repair shared state. Design worker cleanup if cancellation can happen during a resource operation.
179	
180	  - Distinguish task-based and function-based phases.
181	
182	    **Answer. **Function phases complete without consuming simulation time and are suited to construction, connections, and final checks. Task phases can wait for clock edges, delays, or events and perform concurrent stimulus and monitoring. UVM starts run\_phase tasks for components concurrently. Keep a task phase alive with an objection until stimulus ends and required responses drain. A forever loop in a monitor does not keep the phase alive.
183	
184	  - Identify top-down versus bottom-up UVM phase traversal.
185	
186	    **Answer. **build\_phase traverses top-down, so parents configure and create children before the children build. connect\_phase, end\_of\_elaboration\_phase, start\_of\_simulation\_phase, extract\_phase, check\_phase, and report\_phase traverse bottom-up. final\_phase traverses top-down. Task phases launch concurrent component processes, so their execution should not depend on a parent-before-child runtime ordering.
187	
188	    Reference: [UVM phase reference](https://github.com/accellera-official/uvm-core/blob/main/src/base/uvm_common_phases.svh)
189	
190	  - Compare uvm\_config\_db and uvm\_resource\_db.
191	
192	    **Answer. **uvm\_config\_db is a typed, hierarchy-oriented configuration interface built on uvm\_resource\_db. Its context and instance path make it a natural choice for virtual interfaces and agent configuration. uvm\_resource\_db provides more general named or type-based resource access. Prefer config\_db for component configuration; check every get() result and avoid an overly broad wildcard that assigns the wrong interface to several agents.
193	
194	    During build, higher-level config settings have greater precedence; settings at the same level use last-set-wins. After build, settings use the default precedence with last-set-wins behavior. Reference: [UVM configuration reference](https://github.com/accellera-official/uvm-core/blob/main/src/base/uvm_config_db.svh)
195	
196	  - Explain how factory overrides allow replacing implementations without editing the parent test.
197	
198	    **Answer. **A parent creates a base component through base\_driver::type\_id::create(). A derived test registers an override before that creation, so the same parent code receives a derived driver through the base-class handle. Virtual methods provide the replacement behavior. The parent must use factory creation, and the replacement must implement the expected contract.
199	
200	    ```systemverilog
201	    function void build_phase(uvm_phase phase);
202	      base_driver::type_id::set_type_override(stress_driver::get_type());
203	      super.build_phase(phase); // Parent may create the environment here.
204	    endfunction
205	    ```
206	
207	    Both classes must be factory-registered. If the parent builds an object with new(), an override will not affect it. Reference: [UVM factory reference](https://github.com/accellera-official/uvm-core/blob/main/src/base/uvm_factory.svh)
208	
209	  - Explain virtual sequences and how they coordinate multiple sequencers.
210	
211	    **Answer. **A virtual sequence is a sequence that coordinates other sequences across agents. It can start them serially to impose dependencies or with fork/join to generate concurrent traffic. It obtains sequencer handles from a virtual sequencer or through explicit fields. It does not need its own pin-level driver.
212	
213	    ```systemverilog
214	    // bus_sqr and data_sqr are assigned before this sequence starts.
215	    task body();
216	      cfg_seq.start(bus_sqr); // Configure before traffic.
217	      fork
218	        tx_seq.start(data_sqr);
219	        poll_seq.start(bus_sqr);
220	      join
221	    endtask
222	    ```
223	
224	    A common setup starts this sequence on null and fills its typed sequencer handles from the test. Use distinct child sequence objects for concurrent starts, and use locks or protocol coordination only where exclusive access is required.
225	
226	  - Pass a virtual interface from the top-level testbench through uvm\_config\_db.
227	
228	    **Answer. **Set the virtual interface before run\_test(), then retrieve it in the consumer's build\_phase. The type parameter, including any modport or interface parameters, must match on set and get.
229	
230	    ```systemverilog
231	    // Top-level module, after instantiating bus_if bus(clk):
232	    initial begin
233	      uvm_config_db#(virtual bus_if)::set(
234	        null, "uvm_test_top.env.agent.*", "vif", bus);
235	      run_test();
236	    end
237	
238	    // Driver/monitor class:
239	    virtual bus_if vif;
240	    function void build_phase(uvm_phase phase);
241	      super.build_phase(phase);
242	      if (!uvm_config_db#(virtual bus_if)::get(this, "", "vif", vif))
243	        `uvm_fatal("NO_VIF", "Missing virtual interface")
244	    endfunction
245	    ```
246	
247	    Use a distinct scoped setting for each agent. Reference: [UVM configuration reference](https://github.com/accellera-official/uvm-core/blob/main/src/base/uvm_config_db.svh)
248	
249	  - Explain reactive sequences, driver responses, response queues, and preserving sequence IDs.
250	
251	    **Answer. **A reactive sequence chooses its next action from observed DUT requests or prior responses, for example when modeling a slave. A driver can return a response through item\_done(rsp) or put\_response(rsp), depending on its request API and timing. The response must carry the originating request's sequence and transaction IDs so the sequencer can route it to the right sequence.
252	
253	    ```systemverilog
254	    // Driver, after get_next_item(req) and protocol completion:
255	    rsp = response_t::type_id::create("rsp");
256	    rsp.set_id_info(req);
257	    rsp.status = observed_status;
258	    seq_item_port.item_done(rsp); // Complete item and return response.
259	
260	    // Sequence:
261	    finish_item(req);
262	    get_response(rsp, req.get_transaction_id());
263	    ```
264	
265	    finish\_item() completes the item handshake; it does not consume the response queue. Drain responses with get\_response() or enable response\_handler(), and choose a queue depth suitable for outstanding traffic. Completing the item and delivering a response are separate steps, even when item\_done(rsp) does both in one call. Reference: [UVM sequence reference](https://github.com/accellera-official/uvm-core/blob/main/src/seq/uvm_sequence_base.svh)
266	
267	+ ## SystemVerilog constrained-random and testbench questions
268	
269	  ### Direct interview examples
270	
271	  - \[Meta] Share 10 units among four recipients with each getting at least one, using constraints.
272	
273	    **Answer. **Use four bounded positive integers and constrain their total to ten. Bounding each value also prevents arithmetic overflow from creating an unintended solution.
274	
275	    ```systemverilog
276	    class shares;
277	      rand int unsigned amount[4];
278	      constraint c {
279	        foreach (amount[i]) amount[i] inside {[1:7]};
280	        amount.sum() with (int'(item)) == 10;
281	      }
282	    endclass
283	    ```
284	
285	    The largest legal share is seven because the other three recipients need at least one each. Always check the return value of randomize().
286	
287	  - \[NVIDIA] Constrain a 32-bit word to prevent runs of five identical bits, without post\_randomize.
288	
289	    **Answer. **Check every five-bit window. Disallow both 00000 and 11111, so a longer identical run is also impossible. This follows the note's wording that even a run of five is prohibited.
290	
291	    ```systemverilog
292	    class no_five;
293	      rand bit [31:0] word;
294	      constraint c {
295	        foreach (word[i])
296	          if (i <= 27) {
297	            word[i +: 5] != 5'b00000;
298	            word[i +: 5] != 5'b11111;
299	          }
300	      }
301	    endclass
302	    ```
303	
304	    There are 28 overlapping windows, beginning at indices 0 through 27. If an interviewer instead permits five identical bits and only forbids six, change the window width to six and the final starting index to 26.
305	
306	  - Split 15 distinct integers into three nonempty queues, preserving each exactly once, using constraints.
307	
308	    **Answer. **Constrain all output values to come from the source, make the outputs globally unique, and require their total size to equal the source size. With 15 distinct source values, those rules guarantee that every source value appears exactly once.
309	
310	    - Method 1
311	
312	      ```verilog
313	      class split15;
314	        int src[$] = '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15};
315	        rand int q1[$], q2[$], q3[$];
316	        constraint c {
317	          
318	          q1.size() inside {[1:13]};
319	          q2.size() inside {[1:13]};
320	          q3.size() inside {[1:13]};
321	          
322	          q1.size() + q2.size() + q3.size() == 15;
323	          
324	          foreach (q1[i]) q1[i] inside {src};
325	          foreach (q2[i]) q2[i] inside {src};
326	          foreach (q3[i]) q3[i] inside {src};
327	          
328	          foreach (q1[i]) foreach (q1[j])
329	            if (i < j) q1[i] != q1[j];
330	          foreach (q2[i]) foreach (q2[j])
331	            if (i < j) q2[i] != q2[j];
332	          foreach (q3[i]) foreach (q3[j])
333	            if (i < j) q3[i] != q3[j];
334	          
335	          foreach (q1[i]) foreach (q2[j]) q1[i] != q2[j];
336	          foreach (q1[i]) foreach (q3[j]) q1[i] != q3[j];
337	          foreach (q2[i]) foreach (q3[j]) q2[i] != q3[j];
338	        }
339	      endclass
340	      ```
341	
342	      It uses only constraints. It does not preserve the original order within each queue because the prompt does not require that. If source values can repeat, map source indices instead of enforcing value uniqueness.
343	
344	    - Method 2
345	
346	      ```verilog
347	      class split15_sel;
348	        int src[$] = '{1,2,3,4,5,6,7,8,9,10,11,12,13,14,15};
349	        rand bit [1:0] idx[15];   // queue selector per source position
350	        rand int cnt[3];          // how many positions select each queue
351	        int q0[$], q1[$], q2[$];
352	
353	        constraint c {
354	          foreach (idx[i]) idx[i] inside {[0:2]};
355	          foreach (cnt[k]) cnt[k] == idx.sum() with (int'(item == k));
356	          foreach (cnt[k]) cnt[k] >= 1;
357	        }
358	
359	        function void post_randomize();
360	          int pool[$];
361	          int v;
362	          pool = src;                  // copy, so src is not consumed
363	          q0.delete(); q1.delete(); q2.delete();
364	          foreach (idx[i]) begin
365	            v = pool.pop_front();
366	            case (idx[i])
367	              2'd0: q0.push_back(v);
368	              2'd1: q1.push_back(v);
369	              2'd2: q2.push_back(v);
370	              default: $fatal(1, "idx out of range");
371	            endcase
372	          end
373	        endfunction
374	      endclass
375	      ```
376	
377	    - Method 3
378	
379	      ```verilog
380	      constraint c {
381	        q1.size() inside {[1:13]};
382	        q2.size() inside {[1:13]};
383	        q3.size() inside {[1:13]};
384	        q1.size() + q2.size() + q3.size() == 15;
385	        foreach (q1[i]) q1[i] inside {src};
386	        foreach (q2[i]) q2[i] inside {src};
387	        foreach (q3[i]) q3[i] inside {src};
388	        unique {q1, q2, q3};
389	      }
390	      ```
391	
392	  - In a ten-element array, require one value to appear exactly three times and all others to be distinct.
393	
394	    **Answer. **Randomize a repeated value and a position mask with exactly three set entries. Masked positions equal the repeated value; all unmasked positions differ from it and from each other.
395	
396	    ```systemverilog
397	    class triple_repeat;
398	      rand int a[10];
399	      rand int repeated;
400	      rand bit is_repeat[10];
401	      constraint c {
402	        is_repeat.sum() with (int'(item)) == 3;
403	        
404	        foreach (a[i]) {
405	          if (is_repeat[i]) a[i] == repeated;
406	          else a[i] != repeated;
407	          foreach (a[j])
408	            if (i < j && !is_repeat[i] && !is_repeat[j])
409	              a[i] != a[j];
410	        }
411	      }
412	    endclass
413	    ```
414	
415	    No value domain is needed; add a\[i] inside {\[lo:hi]} if the prompt gives one, with at least eight values in the range. The solution uses eight distinct values: one appearing three times and seven appearing once. Pairwise uniqueness by itself would prohibit the required triple.
416	
417	  - Match parity of every array item to the parity of its index.
418	
419	    **Answer. **Parity is the least significant bit, so equate each element's low bit to the low bit of its index. This also works for negative signed integers without relying on negative remainder behavior.
420	
421	    ```systemverilog
422	    rand int a[10];
423	    constraint parity_c {
424	      foreach (a[i]) a[i][0] == i[0];
425	    }
426	    ```
427	
428	  - Generate a 32-bit word differing from the previous result in exactly two bit positions.
429	
430	    **Answer. **The XOR of the new and previous words marks changed positions. Exactly two set bits in that XOR means a Hamming distance of two. Keep previous as non-random state and update it only after a successful randomization.
431	
432	    ```systemverilog
433	    class two_changes;
434	      rand bit [31:0] addr;
435	      bit [31:0] addr_prev = 'd3; // it's arbitrary
436	      constraint addr_c {
437	        $countones(addr ^ addr_prev) == 2;
438	      }
439	      function void post_randomize();
440	        addr_prev = addr;
441	      endfunction
442	    endclass
443	    ```
444	
445	    The first result is unconstrained by history. For an initial reference value of zero, set have\_previous=1 before the first call. A failed randomize() does not call post\_randomize(), so history remains intact.
446	
447	  - Manage fork/join\_any, selectively cancel one thread, and wait for others.
448	
449	    **Answer. **join\_any returns after the first child finishes. It leaves the others running. To cancel only a selected child, capture its process handle and call `kill();` then `wait fork` for the remaining children. This follows the process-class example in IEEE 1800 section 9.7.
450	
451	    ```verilog
452	    task automatic selective_cancel();
453	      process p[3];
454	      fork begin                      // isolate wait fork from caller's children
455	        fork
456	          begin p[0] = process::self(); work(0); end
457	          begin p[1] = process::self(); work(1); end
458	          begin p[2] = process::self(); work(2); end
459	        join_any
460	        wait (p[1] != null);          // handle may not be assigned yet
461	        if (p[1].status() != process::FINISHED) p[1].kill();
462	        wait fork;                    // wait for the survivors
463	      end join
464	    endtask
465	    ```
466	
467	    `join_any` resumes the parent as soon as any child finishes. If `work(0)` takes zero time, worker 0 can finish before worker 1 has run `process::self()`, and calling `status()` on a null handle is a fatal error. `wait (p[1] != null)` prevents that. If worker 1 was the first finisher, it is already complete and the status check skips `kill()`. The outer `fork begin ... end join` isolates wait fork from unrelated children of the caller. disable fork would cancel all remaining descendants of the calling process, so it is inappropriate for selecting just worker 1.
468	
469	    For N threads, spawn in a loop with join\_none and an automatic copy of the index, because `join_none` children run after the loop variable has moved on. Then wait for the first finisher with p\[x].await() or a mailbox.
470	
471	    Shorter alternative for a fixed set of threads: name each block and disable the selected one by name.
472	
473	    ```verilog
474	    task automatic selective_cancel();
475	      fork begin
476	        fork
477	          begin : t0  work(0); end
478	          begin : t1  work(1); end
479	          begin : t2  work(2); end
480	        join_any
481	        disable t1;
482	        wait fork;
483	      end join
484	    endtask
485	    ```
486	
487	    This has three limits. First, disable acts on a block's static scope, so it kills every active instance of t1, including those in other concurrent calls of the task. p\[1].kill() affects only the one process its handle refers to. Second, threads spawned in a loop share one block name, so you cannot select a single one. Third, if t0 finishes in zero time before t1 starts, disable t1 has nothing to disable and t1 runs to completion. In an interview, give this version for "three threads, cancel one", then say you would switch to process handles for reentrant tasks or N threads.
488	
489	  - Explain how loop-index capture affects processes launched using fork/join\_none.
490	
491	    **Answer. **Children created with join\_none do not begin executing until the parent suspends or terminates. A child that later reads a shared loop variable can therefore see the final value. Capture the index in an automatic variable in the loop body before the fork.
492	
493	    ```verilog
494	    for (int i = 0; i < 5; i++) begin
495	      automatic int k = i;
496	      fork
497	        $display("k=%0d", k);
498	      join_none
499	    end
500	    wait fork;
501	    // prints k=0 .. k=4 (order not guaranteed)
502	
503	    // Bug: every child reads the shared i after the loop ends
504	    for (int i = 0; i < 5; i++)
505	      fork
506	        $display("i=%0d", i);
507	      join_none
508	    // prints i=5 five times
509	    ```
510	
511	    Putting the capture assignment inside the child is too late, because that child starts after the parent yields. The captured automatic variable belongs to the iteration and remains alive while the spawned process uses it.
512	
513	  - \[SpaceX] Generate N even values followed by N odd values for a randomized array.
514	
515	    **Answer. **For the stated requirement, use a length-2N array. Indices below N are even and the rest are odd. If the interviewer means repeating groups of N even then N odd values in a longer array, use the group index i/N.
516	
517	    ```systemverilog
518	    class even_then_odd;
519	      rand int n;
520	      rand int unsigned a[];
521	      constraint c {
522	        n inside {[1:32]};
523	        a.size() == 2*n;
524	        foreach (a[i]) {
525	          if (i < n) a[i][0] == 0;
526	          else       a[i][0] == 1;
527	        }
528	      }
529	    endclass
530	    // For repeating groups, replace the if/else with:
531	    // a[i][0] == ((i / n) % 2);
532	    ```
533	
534	  - Generate a contiguous five-bit set pattern under a specified probability distribution.
535	
536	    **Answer. **Pick the mode first with dist, then constrain the word for that mode. Every draw has exactly five set bits. With 80% probability they form one run (32'h1f shifted to a random start). Otherwise they are scattered, and no five-bit run is allowed.
537	
538	    ```verilog
539	    class five_bits;
540	      rand bit [31:0] word;
541	      rand bit run;
542	      rand int unsigned start;
543	      constraint c {
544	        run dist {1 := 80, 0 := 20};
545	        solve run before word;
546	        start inside {[0:27]};          // 28 legal run positions
547	        $countones(word) == 5;
548	        if (run) word == 32'h1f << start;
549	        else foreach (word[i])
550	          if (i <= 27) word != 32'h1f << i; // equivalent: word[i+"5"] == 5'b1111
551	      }
552	    endclass
553	    ```
554	
555	    solve run before word keeps the 80/20 split explicit. There are only 28 run patterns against about 200,000 scattered ones, so the mode must be chosen before the word. If the prompt only needs a single run every time, drop run and keep word == 32'h1f << start. dist sets a probability, so 80% does not mean exactly 8 runs in every 10 calls.
556	
557	  - \[NVIDIA] Randomize distinct playing cards with additional suit/color restrictions.
558	
559	    **Answer. **Encode a card as an integer 0 through 51. suit=id/13 and rank=id%13; ranks can be translated to 1 through 13 for display. Constrain card IDs to be distinct, then add suit or color rules. Here suits 0/1 are black and 2/3 are red, and three cards have distinct suits with exactly two red cards.
560	
561	    ```systemverilog
562	    class hand3;
563	      rand int unsigned id[3];
564	      constraint c {
565	        foreach (id[i]) {
566	          id[i] inside {[0:51]};
567	          foreach (id[j]) if (i < j) {
568	            id[i] != id[j];
569	            (id[i] / 13) != (id[j] / 13);
570	          }
571	        }
572	        id.sum() with (int'((item / 13) >= 2)) == 2;
573	      }
574	    endclass
575	    ```
576	
577	    Clarify whether 'type' means rank or suit. Three pairwise distinct colors are impossible in a standard deck because there are only two colors. Two cards can have different colors; three cards can have distinct suits or a specified red/black count. The example picks one feasible reading, so confirm it with the interviewer.
578	
579	  - \[NVIDIA] Generate a ten-element array containing exactly one duplicate pair at randomized positions.
580	
581	    **Answer. **Use the same position-mask technique as the triple-repeat problem, but require exactly two masked positions. The other eight values are all distinct and cannot equal the repeated value.
582	
583	    ```systemverilog
584	    class one_pair;
585	      rand int a[10];
586	      rand int repeated;
587	      rand bit is_repeat[10];
588	      constraint c {
589	        is_repeat.sum() with (int'(item)) == 2;
590	        
591	        foreach (a[i]) {
592	          if (is_repeat[i]) a[i] == repeated;
593	          else a[i] != repeated;
594	          foreach (a[j])
595	            if (i < j && !is_repeat[i] && !is_repeat[j])
596	              a[i] != a[j];
597	        }
598	      }
599	    endclass
600	    ```
601	
602	    This creates nine distinct values overall. The duplicated positions are random variables. A satisfiable constraint does not prove they are uniformly distributed, so check the distribution over many draws.
603	
604	  - \[AMD] Generate exactly one triple duplicate and otherwise distinct elements.
605	
606	    **Answer. **Use the complete triple\_repeat class in direct example 4 above. Its mask contains exactly three set positions, which all take repeated; every other position takes a different value. This guarantees one triple and seven singletons in a ten-element array. For a different length, resize the array and mask together and keep the repetition count at three.
607	
608	  - \[Meta] Constrain a 2D pixel array using each pixel's four immediate neighbors.
609	
610	    **Answer. **Assume the intended relation is pixel < sum of its existing top, bottom, left, and right neighbors. This example uses a fixed 4x5 image and zero contribution outside the boundary. Cast every neighbor to int before adding, so a sum of four 16-bit pixels cannot overflow a 16-bit expression.
611	
612	    ```systemverilog
613	    class pixels;
614	      rand bit [15:0] p[4][5];
615	      constraint c {
616	        foreach (p[r,c])
617	          int'(p[r][c]) <
618	            ((r > 0) ? int'(p[r-1][c]) : 0) +
619	            ((r < 3) ? int'(p[r+1][c]) : 0) +
620	            ((c > 0) ? int'(p[r][c-1]) : 0) +
621	            ((c < 4) ? int'(p[r][c+1]) : 0);
622	      }
623	    endclass
624	    ```
625	
626	    Choose boundary behavior explicitly: available neighbors, fixed padding, wraparound, or interior-only constraints. Scaling a coupled constraint to a full image may be expensive; a constant nonzero image is a simple satisfiable case when each cell has at least two neighbors. A 1x1 image with zero padding has no solution under this strict inequality.
627	
628	  ### Further practice from the source
629	
630	  - Sum a ten-element array to 100 without the array sum method.
631	
632	    **Answer. **Use a prefix-sum array. Each prefix equals the previous prefix plus the next element, and the last prefix equals 100. The example bounds elements to nonnegative values; widen the arithmetic if negative or very large values are allowed.
633	
634	    ```systemverilog
635	    class total100;
636	      rand int unsigned a[10];
637	      rand int unsigned prefix[11];
638	      constraint c {
639	        foreach (a[i]) a[i] inside {[0:100]};
640	        foreach (prefix[i]) prefix[i] inside {[0:100]};
641	        prefix[0] == 0;
642	        foreach (a[i]) prefix[i+1] == prefix[i] + a[i];
643	        prefix[10] == 100;
644	      }
645	    endclass
646	    ```
647	
648	    For a fixed ten-element array, explicitly adding a\[0] through a\[9] is also correct. Prefix sums scale to a configurable size without using the array sum method.
649	
650	  - Constrain multidimensional arrays to unique values, bounded sums, and neighborhood conditions.
651	
652	    **Answer. **Flatten coordinates when a reduction over several dimensions would be awkward. For a 3x3x3 cube, index=9\*r+3\*c+d. Make the flat values unique and constrain the cube to that mapping. For a binary MxN matrix, use a flat binary array and bound its sum. These are separate examples; a binary matrix with more than two cells cannot also have globally unique values.
653	
654	    ```systemverilog
655	    class unique_cube;
656	      rand int flat[27];
657	      rand int cube[3][3][3];
658	      constraint c {
659	        foreach (flat[i]) {
660	          flat[i] inside {[0:99]};
661	          foreach (flat[j]) if (i < j) flat[i] != flat[j];
662	        }
663	        foreach (cube[r,c,d]) cube[r][c][d] == flat[9*r+3*c+d];
664	      }
665	    endclass
666	
667	    class binary_matrix;
668	      rand bit flat[12];
669	      rand bit m[3][4];
670	      constraint c {
671	        flat.sum() with (int'(item)) < 7; // Example MAX_SUM=7.
672	        foreach (m[r,c]) m[r][c] == flat[4*r+c];
673	      }
674	    endclass
675	    ```
676	
677	    Neighbor inequality uses guarded comparisons. If r+1 is in range, constrain m\[r]\[c]!=m\[r+1]\[c]; do the same for c+1. Each undirected adjacent pair is then checked once. A sum-of-neighbors relation uses widened additions as in the pixel example. Check that the value domain is large enough for the requested uniqueness.
678	
679	  - Avoid repeating a selected color across the next three draws.
680	
681	    **Answer. **Store the last three successful choices as non-random history. Exclude each stored color during the next randomization, then push the new color and trim the history to three entries. That prevents a selected color from reappearing in the next three draws.
682	
683	    ```systemverilog
684	    class color_stream;
685	      rand int unsigned color;
686	      int unsigned history[$];
687	      constraint c {
688	        color inside {[0:9]};
689	        foreach (history[i]) color != history[i];
690	      }
691	      function void post_randomize();
692	        history.push_back(color);
693	        if (history.size() > 3) void'(history.pop_front());
694	      endfunction
695	    endclass
696	    ```
697	
698	    At least four available colors are needed for indefinite generation under this rule. History changes only on successful randomization. randc is different: it prevents repetition over its whole cycle, not specifically a three-draw window.
699	
700	  - Map an input array to a configurable number of nonempty output queues, without missing or duplicating values.
701	
702	    **Answer. **Map source positions rather than source values. This handles an input that contains repeated values. Represent each output queue by an active prefix of a fixed-capacity row. Constrain lengths to be nonzero for the configured queues, total length to equal the input length, and all active source indices to be distinct. The full source index range and the total count then guarantee exact preservation.
703	
704	    ```systemverilog
705	    class partition;
706	      localparam int M = 15, MAX_Q = 5;
707	      int n = 3;                 // Configure in [1:MAX_Q], n <= M.
708	      int src[M];               // Fill before randomize().
709	      rand int len[MAX_Q];
710	      rand int idx[MAX_Q][M];
711	      rand int value[MAX_Q][M];
712	      constraint c {
713	        foreach (len[q]) {
714	          if (q < n) len[q] inside {[1:M]};
715	          else len[q] == 0;
716	        }
717	        len.sum() == M;
718	        foreach (idx[q,k]) {
719	          if (k < len[q]) {
720	            idx[q][k] inside {[0:M-1]};
721	            value[q][k] == src[idx[q][k]];
722	            foreach (idx[r,s])
723	              if (s < len[r] && (q < r || (q == r && k < s)))
724	                idx[q][k] != idx[r][s];
725	          } else {
726	            idx[q][k] == 0;
727	            value[q][k] == 0;
728	          }
729	        }
730	      }
731	    endclass
732	    ```
733	
734	    Queue q consists of value\[q]\[0] through value\[q]\[len\[q]-1]. Copying that already-solved prefix into an actual queue is representation conversion, not a fix-up of invalid random data. This representation avoids tool-dependent solving of nested variable-size queues. A pure three-queue form is shown in direct example 3. Reject n=0, n>M, or n>MAX\_Q before solving.
735	
736	  - Make a length-300 array satisfy frequency quotas and restricted adjacent repeats.
737	
738	    **Answer. **Assume values 0 through 4, each occurring more than 40 times, with only zero permitted to repeat immediately. Count occurrences with a reduction that casts the Boolean match to int; otherwise a narrow reduction can overflow.
739	
740	    ```systemverilog
741	    class quota300;
742	      rand int a[300];
743	      constraint c {
744	        foreach (a[i]) {
745	          a[i] inside {[0:4]};
746	          if (i > 0 && a[i] != 0) a[i] != a[i-1];
747	        }
748	        a.sum() with (int'(item == 0)) >= 41;
749	        a.sum() with (int'(item == 1)) >= 41;
750	        a.sum() with (int'(item == 2)) >= 41;
751	        a.sum() with (int'(item == 3)) >= 41;
752	        a.sum() with (int'(item == 4)) >= 41;
753	      }
754	    endclass
755	    ```
756	
757	    For the variant with values 0 through 5, at least 40 of each, and no consecutive zeros, add the sixth quota, use >=40, and replace the adjacent rule with: if(i>0 && a\[i]==0) a\[i-1]!=0. The required counts must fit in 300; adjacent restrictions may impose further feasibility limits.
758	
759	  - Generate Sudoku, magic squares, eight queens, and knight's tour configurations.
760	
761	    **Answer. **For Sudoku, constrain every cell to 1 through 9 and make cells in the same row, column, or 3x3 box distinct. This generates a solved grid. It does not generate a puzzle with a unique solution and a chosen difficulty.
762	
763	    ```systemverilog
764	    class sudoku;
765	      rand int x[9][9];
766	      constraint c {
767	        foreach (x[r,c]) {
768	          x[r][c] inside {[1:9]};
769	          foreach (x[u,v])
770	            if ((r != u || c != v) &&
771	                (r == u || c == v || (r/3 == u/3 && c/3 == v/3)))
772	              x[r][c] != x[u][v];
773	        }
774	      }
775	    endclass
776	
777	    // Normal 3x3 magic square, using each value 1..9 exactly once.
778	    class magic3;
779	      rand int a[9];
780	      constraint c {
781	        foreach (a[i]) {
782	          a[i] inside {[1:9]};
783	          foreach (a[j]) if (i < j) a[i] != a[j];
784	        }
785	        a[0]+a[1]+a[2] == 15;
786	        a[3]+a[4]+a[5] == 15;
787	        a[6]+a[7]+a[8] == 15;
788	        a[0]+a[3]+a[6] == 15;
789	        a[1]+a[4]+a[7] == 15;
790	        a[2]+a[5]+a[8] == 15;
791	        a[0]+a[4]+a[8] == 15;
792	        a[2]+a[4]+a[6] == 15;
793	      }
794	    endclass
795	
796	    // One queen in each row; col[r] gives its column.
797	    class queens8;
798	      rand int col[8];
799	      constraint c {
800	        foreach (col[i]) {
801	          col[i] inside {[0:7]};
802	          foreach (col[j]) if (i < j) {
803	            col[i] != col[j];
804	            col[i] - col[j] != i - j;
805	            col[i] - col[j] != j - i;
806	          }
807	        }
808	      }
809	    endclass
810	
811	    // Open knight's tour. Each step selects a distinct square.
812	    class knight8;
813	      rand int r[64], c[64];
814	      constraint tour_c {
815	        foreach (r[i]) {
816	          r[i] inside {[0:7]}; c[i] inside {[0:7]};
817	          foreach (r[j]) if (i < j)
818	            (r[i] != r[j]) || (c[i] != c[j]);
819	          if (i < 63)
820	            (((r[i+1]-r[i] == 1) || (r[i+1]-r[i] == -1)) &&
821	             ((c[i+1]-c[i] == 2) || (c[i+1]-c[i] == -2))) ||
822	            (((r[i+1]-r[i] == 2) || (r[i+1]-r[i] == -2)) &&
823	             ((c[i+1]-c[i] == 1) || (c[i+1]-c[i] == -1)));
824	        }
825	      }
826	    endclass
827	    ```
828	
829	    A normal NxN magic square uses values 1 through N² and line sum N\*(N²+1)/2; use prefix sums for parameterized rows, columns, and diagonals. N=2 is unsatisfiable. For a closed knight's tour, also constrain the last square to be a knight move from the first. The tour's large search space may make pure randomization slow; backtracking with a move-order heuristic is a practical alternative when procedural generation is allowed.
830	
831	  - Apply a distribution based on the previous random value, including parity probabilities.
832	
833	    **Answer. **Choose the next parity with the conditional probability, then solve the value consistent with that parity. Keep the previous result as state. This example makes the next value even with probability 75% after an odd result and 25% after an even result.
834	
835	    ```systemverilog
836	    class conditional_parity;
837	      rand bit [7:0] value;
838	      rand bit choose_even;
839	      bit [7:0] previous = 0;
840	      bit have_previous = 0;
841	      constraint c {
842	        if (!have_previous) choose_even dist {1 := 50, 0 := 50};
843	        else if (previous[0]) choose_even dist {1 := 75, 0 := 25};
844	        else choose_even dist {1 := 25, 0 := 75};
845	        solve choose_even before value;
846	        value[0] == !choose_even;
847	      }
848	      function void post_randomize();
849	        previous = value;
850	        have_previous = 1;
851	      endfunction
852	    endclass
853	    ```
854	
855	    For other conditional distributions, constrain a selector based on previous, then constrain the result based on that selector. Check statistical results over many draws; an 80% weight does not guarantee exactly eight successes in each ten draws.
856	
857	  - Make the four most recent generated values distinct.
858	
859	    **Answer. **Exclude the last three successful values from the new draw. That makes every sliding window of four values distinct. Use color\_stream above with the desired value domain instead of the color domain. The history starts empty, and it contains at most three values after each update. The domain must have at least four values for generation to continue indefinitely.
860	
861	  - Generate equal-size arrays where one is sorted and the other is a permutation.
862	
863	    **Answer. **For unique input values, constrain one array to be strictly increasing and make the other a same-sized, unique selection from it. If duplicates are allowed, use a permutation of indices instead so multiplicities are preserved. The following version handles duplicates.
864	
865	    ```systemverilog
866	    class sorted_and_permuted;
867	      rand int a[], b[], pick[];
868	      constraint c {
869	        a.size() inside {[6:9]};
870	        b.size() == a.size();
871	        pick.size() == a.size();
872	        foreach (a[i]) {
873	          a[i] inside {[0:99]};
874	          if (i > 0) a[i] >= a[i-1];
875	          pick[i] inside {[0:a.size()-1]};
876	          b[i] == a[pick[i]];
877	          foreach (pick[j]) if (i < j) pick[i] != pick[j];
878	        }
879	      }
880	    endclass
881	    ```
882	
883	    Use > instead of >= if 'ascending' means strictly increasing. Membership alone is insufficient when duplicate values are present because it does not preserve their occurrence counts.
884	
885	  - Constrain dates to leap years and numbers to powers of four.
886	
887	    **Answer. **A Gregorian leap year is divisible by four, except century years must also be divisible by 400. For a 32-bit power of four, choose an exponent 0 through 15 and set the word to one shifted left by twice that exponent. This includes 1, which is 4⁰, and excludes zero.
888	
889	    ```systemverilog
890	    class leap_date;
891	      rand int year, month, day;
892	      constraint c {
893	        year inside {[1900:2400]};
894	        (year % 4 == 0) && ((year % 100 != 0) || (year % 400 == 0));
895	        month inside {[1:12]};
896	        day >= 1;
897	        if (month == 2) day <= 29;
898	        else if (month inside {4,6,9,11}) day <= 30;
899	        else day <= 31;
900	      }
901	    endclass
902	
903	    class power4;
904	      rand bit [31:0] value;
905	      rand int unsigned exponent;
906	      constraint c {
907	        exponent inside {[0:15]};
908	        value == (32'b1 << (2*exponent));
909	      }
910	    endclass
911	    ```
912	
913	    If the prompt only requests a year, the month/day constraints are unnecessary. An alternate power-of-four test is nonzero, one-hot, and set only at an even bit position: value!=0; (value & (value-1))==0; (value & 32'haaaa\_aaaa)==0.
914	
915	  - Generate weighted bit counts, grouped runs of ones, nonadjacent set bits, or equal counts of ones and zeros.
916	
917	    **Answer. **Use a helper count with explicit weights for weighted population counts. For grouped ones, choose a run length and legal start. For no adjacent ones, require word & (word<<1) to be zero. Equal ones and zeros in an even-width word means a population count of half its width. These are independent patterns, not simultaneous requirements.
918	
919	    ```systemverilog
920	    class weighted_count;
921	      rand bit [9:0] word;
922	      rand int count;
923	      constraint c {
924	        count dist {[1:10] := 1}; // Equal weight for each count.
925	        solve count before word;
926	        $countones(word) == count;
927	      }
928	    endclass
929	
930	    class one_run;
931	      rand bit [31:0] word;
932	      rand int unsigned start, length;
933	      constraint c {
934	        length inside {[1:32]};
935	        start inside {[0:31]};
936	        start + length <= 32;
937	        word == (32'hffff_ffff >> (32-length)) << start;
938	      }
939	    endclass
940	
941	    class separated_ones;
942	      rand bit [31:0] word;
943	      constraint c { (word & (word << 1)) == 0; }
944	    endclass
945	
946	    class balanced_bits;
947	      rand bit [31:0] word;
948	      constraint c { $countones(word) == 16; }
949	    endclass
950	    ```
951	
952	    To require exactly ten nonadjacent ones without \$countones, use an unpacked bit array bits\[32], bits.sum() with (int'(item))==10, and foreach(bits\[i]) if(i>0) !(bits\[i] && bits\[i-1]); map it to a packed word if needed. := assigns weight to each value in a range, whereas :/ shares a range's total weight. For 'lower two bits equal only 5% of the time', choose a 5/95 equality flag first and constrain (word\[1]==word\[0]) to it.
953	
954	  - Constrain instruction sequences to prohibit specified operations within recent valid instructions or overlapping execution intervals.
955	
956	    **Answer. **Distinguish elapsed cycles from valid instructions. Maintain a cycle-history window for ADD and a separate history of valid operations for SUB, excluding NOP. Here an ADD is prohibited if any of the previous three cycles contained ADD, and SUB is prohibited if any of the previous three valid instructions contained SUB.
957	
958	    ```systemverilog
959	    typedef enum int {ADD, MUL, SUB, NOP} op_t;
960	    class instruction_stream;
961	      rand op_t op;
962	      op_t cycles[$], valid_ops[$];
963	      constraint c {
964	        foreach (cycles[i]) if (cycles[i] == ADD) op != ADD;
965	        foreach (valid_ops[i]) if (valid_ops[i] == SUB) op != SUB;
966	      }
967	      function void post_randomize();
968	        cycles.push_back(op);
969	        if (cycles.size() > 3) void'(cycles.pop_front());
970	        if (op != NOP) begin
971	          valid_ops.push_back(op);
972	          if (valid_ops.size() > 3) void'(valid_ops.pop_front());
973	        end
974	      endfunction
975	    endclass
976	
977	    // Independent example: prohibit overlap for operations sharing a resource.
978	    rand int start[10], finish[10], resource[10];
979	    constraint intervals_c {
980	      foreach (start[i]) {
981	        start[i] inside {[0:100]};
982	        finish[i] inside {[1:110]};
983	        finish[i] > start[i];
984	        resource[i] inside {[0:3]};
985	        foreach (start[j]) if (i < j && resource[i] == resource[j])
986	          (finish[i] <= start[j]) || (finish[j] <= start[i]);
987	      }
988	    }
989	    ```
990	
991	    The interval example treats execution as \[start,finish), so one operation may start exactly when another finishes. Clarify whether 'in three cycles' includes the current cycle; if it means a three-cycle window including now, retain only two previous cycles. History must update on the modeled cycle or acceptance event, not on unrelated retries of randomize().
992	
993	  - Constrain 2D matrices to unique row maxima, unique minima, and boundary-dependent neighboring values.
994	
995	    **Answer. **Select the position of each row maximum. Every other element in that row must be strictly smaller, and maximum values across rows must differ. Use the same technique with > for a unique minimum. Checking only unequal maximum positions would not make the maximum values different.
996	
997	    ```systemverilog
998	    class row_maxima;
999	      rand int m[3][4];
1000	      rand int max_col[3];
1001	      constraint c {
1002	        foreach (max_col[r]) {
1003	          max_col[r] inside {[0:3]};
1004	          foreach (max_col[s]) if (r < s)
1005	            m[r][max_col[r]] != m[s][max_col[s]];
1006	        }
1007	        foreach (m[r,c]) {
1008	          m[r][c] inside {[0:99]};
1009	          if (c != max_col[r]) m[r][c] < m[r][max_col[r]];
1010	        }
1011	      }
1012	    endclass
1013	
1014	    // Two 3x3 matrices with a unique minimum in each,
1015	    // and different minimum values between the matrices.
1016	    class matrix_minima;
1017	      rand int a[9], b[9];
1018	      rand int ia, ib;
1019	      constraint c {
1020	        ia inside {[0:8]}; ib inside {[0:8]};
1021	        foreach (a[i]) {
1022	          a[i] inside {[0:99]}; b[i] inside {[0:99]};
1023	          if (i != ia) a[i] > a[ia];
1024	          if (i != ib) b[i] > b[ib];
1025	        }
1026	        a[ia] != b[ib];
1027	      }
1028	    endclass
1029	    ```
1030	
1031	    For adjacent inequalities, constrain the right neighbor when c+1<C and the lower neighbor when r+1<R. For 'one maximum per subsquare', first define whether subsquares are disjoint blocks or overlapping windows; introduce a winner coordinate for each specified block/window and compare it with every other member. Without that definition, there is no single exact constraint system.
1032	
1033	  - Randomize matrix dimensions and perform a 90-degree rotation.
1034	
1035	    **Answer. **A clockwise rotation maps input\[r]\[c] to output\[c]\[R-1-r]. The output dimensions are C by R. Counterclockwise rotation maps input\[r]\[c] to output\[C-1-c]\[r]. Rotation is a deterministic transform, so it can be done procedurally after generating the input, or expressed as equalities if both arrays must be part of the solve.
1036	
1037	    ```systemverilog
1038	    class rotate_matrix;
1039	      rand int rows, cols;
1040	      rand int input_m[8][8], output_m[8][8];
1041	      constraint c {
1042	        rows inside {[1:8]}; cols inside {[1:8]};
1043	        foreach (input_m[r,c]) {
1044	          if (r < rows && c < cols) {
1045	            input_m[r][c] inside {[0:255]};
1046	            output_m[c][rows-1-r] == input_m[r][c];
1047	          } else input_m[r][c] == 0;
1048	        }
1049	        foreach (output_m[r,c])
1050	          if (r >= cols || c >= rows) output_m[r][c] == 0;
1051	      }
1052	    endclass
1053	    ```
1054	
1055	    This uses fixed storage with random active dimensions to avoid ragged-array allocation issues. If an odd square is required, add rows==cols and rows%2==1. A 2x3 input with rows \[a b c] and \[d e f] rotates clockwise to \[d a], \[e b], \[f c]. Four clockwise rotations recover the input.
1056	
1057	  - Generate a tic-tac-toe board.
1058	
1059	    **Answer. **For a legal tic-tac-toe position, encode empty=0, X=1, O=2 and assume X moves first. Require X count to equal O count or exceed it by one, forbid both players winning, and relate any winner to the move counts. These conditions describe reachable standard 3x3 positions when play stops at a win.
1060	
1061	    ```systemverilog
1062	    class tic_tac_toe;
1063	      rand int board[9];
1064	      rand bit xwin, owin;
1065	      constraint c {
1066	        foreach (board[i]) board[i] inside {[0:2]};
1067	        (board.sum() with (int'(item == 1)) ==
1068	         board.sum() with (int'(item == 2))) ||
1069	        (board.sum() with (int'(item == 1)) ==
1070	         (board.sum() with (int'(item == 2))) + 1);
1071	        xwin == (
1072	          (board[0]==1 && board[1]==1 && board[2]==1) ||
1073	          (board[3]==1 && board[4]==1 && board[5]==1) ||
1074	          (board[6]==1 && board[7]==1 && board[8]==1) ||
1075	          (board[0]==1 && board[3]==1 && board[6]==1) ||
1076	          (board[1]==1 && board[4]==1 && board[7]==1) ||
1077	          (board[2]==1 && board[5]==1 && board[8]==1) ||
1078	          (board[0]==1 && board[4]==1 && board[8]==1) ||
1079	          (board[2]==1 && board[4]==1 && board[6]==1));
1080	        owin == (
1081	          (board[0]==2 && board[1]==2 && board[2]==2) ||
1082	          (board[3]==2 && board[4]==2 && board[5]==2) ||
1083	          (board[6]==2 && board[7]==2 && board[8]==2) ||
1084	          (board[0]==2 && board[3]==2 && board[6]==2) ||
1085	          (board[1]==2 && board[4]==2 && board[7]==2) ||
1086	          (board[2]==2 && board[5]==2 && board[8]==2) ||
1087	          (board[0]==2 && board[4]==2 && board[8]==2) ||
1088	          (board[2]==2 && board[4]==2 && board[6]==2));
1089	        !(xwin && owin);
1090	        if (xwin) board.sum() with (int'(item == 1)) ==
1091	                  (board.sum() with (int'(item == 2))) + 1;
1092	        if (owin) board.sum() with (int'(item == 1)) ==
1093	                  board.sum() with (int'(item == 2));
1094	      }
1095	    endclass
1096	    ```
1097	
1098	    For a full game, randomize or generate a sequence of legal moves: choose an empty square, alternate players, and stop immediately at a win or draw. A random board with only cell values 0/1/2 can contain impossible move counts or two winners.
1099	
1100	+ ## Related hardware problems useful for DV
1101	
1102	  ### FIFO / RTL
1103	
1104	  - Verify synchronous and asynchronous FIFO behavior, pointer comparisons, Gray-code crossing, and non-power-of-two depth.
1105	
1106	    **Answer. **For a synchronous FIFO, check accepted push/pop operations against a queue and compute occupancy exactly in its clock domain. A counter or wrap-aware pointers can detect empty/full. For a conventional power-of-two asynchronous FIFO, keep binary pointers locally for RAM addressing, convert them to Gray code for crossing, and synchronize each Gray pointer into the opposite clock domain.
1107	
1108	    For that conventional design, empty compares the next local read Gray pointer with the synchronized write Gray pointer; full compares the next local write Gray pointer with the synchronized read pointer with its two most significant Gray bits inverted. Confirm whether flags use current or next pointers in the actual RTL. Local one-step Gray transitions must change one bit, but a synchronized pointer may skip several source increments and need not differ by only one bit between destination samples. Flags can be pessimistic because of synchronizer latency. Check CDC structure and physical skew constraints in addition to simulation. A binary counter wrapping directly at a non-power-of-two depth does not generally give a one-bit Gray wrap. Use a reviewed arbitrary-depth scheme or a power-of-two physical ring with separately enforced logical capacity. Changing the modulus alone does not work.
1109	
1110	  - Calculate FIFO depth for different producer/consumer clock rates and burst occupancy.
1111	
1112	    **Answer. **Size the FIFO from the worst accumulated backlog, not just the ratio of clock frequencies. Build a time trace of arriving words and successful departures, including initial occupancy, burst lengths, consumer startup delay, clock phase, stalls, and CDC visibility latency. Required usable depth is the maximum occupancy in that trace, plus any explicit implementation margin.
1113	
1114	    ```systemverilog
1115	    // Conceptual occupancy calculation:
1116	    // occupancy(t) = initial_occupancy + cumulative_writes(t)
1117	    //                                  - cumulative_reads(t)
1118	    // depth >= max_t occupancy(t)
1119	    ```
1120	
1121	    For example, an ideal 1 us burst at 100 million words/s with simultaneous draining at 80 million words/s accumulates 20 words. Exact edges, startup delay, and flag latency can increase that requirement. If a continuously running producer is faster than the consumer on average, no finite FIFO can avoid eventual overflow without backpressure or dropping data. Use word throughput, not clock rate alone, when transfers occur only on some cycles.
1122	
1123	  - Explain blocking versus nonblocking assignment scheduling and race conditions.
1124	
1125	    **Answer. **A blocking assignment updates its target when the statement executes. A nonblocking assignment evaluates its right-hand side at execution and schedules the target update for the NBA region. In a clocked pipeline, nonblocking assignments let each stage capture the previous stage's old value. Use blocking assignments for combinational calculations and nonblocking assignments for clocked state.
1126	
1127	    ```systemverilog
1128	    // Starting with a=1, b=0, c=0:
1129	    always_ff @(posedge clk) begin
1130	      a <= b; b <= c; c <= a;
1131	    end
1132	    // After the edge and NBA updates: a=0, b=0, c=1.
1133	
1134	    // Independent alternative, same initial values:
1135	    always @(posedge clk) begin
1136	      a = b; b = c; c = a;
1137	    end
1138	    // In this one block: a=0, b=0, c=0.
1139	    ```
1140	
1141	    Separate active-region processes have no guaranteed execution order. A testbench driving a signal with a blocking assignment on the same edge that RTL samples it can race. Use clocking blocks with deliberate skew or drive before the sampling edge. Nonblocking assignment does not by itself make every testbench sampling operation race-free.
1142	
1143	  - Test fixed-priority and round-robin arbiters.
1144	
1145	    **Answer. **For fixed priority, predict the highest-priority asserted eligible request and compare it with the grant. For round-robin, add a reference priority pointer and update it at the defined service event. Both need one-hot-or-zero grants, no grants to nonrequesters, correct reset state, and stability while a selected transfer stalls.
1146	
1147	    Exercise all requester masks for a small arbiter, persistent contention, intermittent high-priority requests, changing eligibility, reset mid-service, and pointer wraparound. Fixed-priority starvation can be expected behavior; round-robin should bound wait in service opportunities under persistent requests and eventual downstream progress. Cross winner, contention mask, previous winner, and stalls. Measure fairness only under the assumptions the implementation promises.
1148	
1149	  - Verify valid/ready pipeline stages and backpressure under stalls.
1150	
1151	    **Answer. **A transfer occurs only on valid && ready. A source must keep valid and payload stable while valid is asserted and ready is low. A one-entry elastic stage accepts a new item when it is empty or when the old item leaves in that cycle. Its verification model enqueues accepted inputs and compares accepted outputs.
1152	
1153	    ```systemverilog
1154	    // One-entry elastic stage, all signals in the same clock domain.
1155	    assign in_ready = !out_valid || out_ready;
1156	    always_ff @(posedge clk or negedge rst_n) begin
1157	      if (!rst_n) out_valid <= 1'b0;
1158	      else if (in_ready) begin
1159	        out_valid <= in_valid;
1160	        if (in_valid) out_data <= in_data;
1161	      end
1162	    end
1163	
1164	    assert property (@(posedge clk) disable iff (!rst_n)
1165	      out_valid && !out_ready |=> out_valid && $stable(out_data));
1166	    ```
1167	
1168	    Test isolated transfers, full-rate traffic, long and short output stalls, simultaneous input/output transfers, reset while full, and stall release. Check data and every sideband together. This stage has a combinational ready path; a design that must register ready needs enough extra storage, often a skid buffer, to retain transfers already in flight. Interface rules such as AXI's prohibition on combinational input-to-output paths may require that additional structure.
1169	
1170	  ### CDC / STA
1171	
1172	  - Select safe CDC methods for slow-to-fast and fast-to-slow crossings.
1173	
1174	    **Answer. **For a single level that stays stable long enough, use a destination-domain synchronizer, commonly two flip-flops. A slow-to-fast pulse can be sampled only if its width and the destination clock behavior guarantee capture. A short fast-to-slow pulse can be missed entirely, so use pulse stretching with a stated bound, a toggle scheme with a rate bound, or a request/acknowledge handshake.
1175	
1176	    A handshake is appropriate when every event must arrive despite variable clock ratios. A toggle can lose events if it changes twice before the destination observes the first change. Use a data-stable handshake or an asynchronous FIFO for multibit payloads; independently synchronizing each data bit does not preserve coherence. Also test stopped clocks and reset recovery, rather than assuming clock ratio alone proves a safe crossing.
1177	
1178	  - Compare synchronized handshake, recirculation mux, and asynchronous FIFO for wide buses.
1179	
1180	    **Answer. **A synchronized request/acknowledge handshake transfers a stable data word with explicit acknowledgment and backpressure. A recirculation mux keeps the destination register unchanged until a synchronized load control tells it to capture the held source data. That mux arrangement still needs a data-stability protocol and timing constraints; it is not sufficient on its own. An asynchronous FIFO buffers multiple words and supports sustained streams with independent clocks.
1181	
1182	    Choose a handshake for infrequent configuration or status transfers, and an asynchronous FIFO for a stream that needs buffering and throughput. In a bundled-data handshake, hold the payload until acknowledgment and ensure the data reaches the destination before capture. Check reset alignment and do not reuse a handshake slot prematurely. The wide data bus usually bypasses per-bit synchronizers because its coherence comes from holding it stable while the control crosses safely.
1183	
1184	  - Explain metastability, reset synchronization, reconvergence, and CDC constraint consistency.
1185	
1186	    **Answer. **Metastability occurs when a flip-flop samples near a transition and may take longer than usual to settle. Synchronizer stages give extra resolution time and reduce the probability of a metastable value reaching functional logic; they do not eliminate it. RTL simulation cannot measure analog metastability or prove a physical MTBF.
1187	
1188	    Reset may assert asynchronously when required, but deassert it synchronously in each destination clock domain. Check recovery/removal timing and interactions between independently reset domains. Reconvergence occurs when related signals cross through separate synchronizers and later meet with inconsistent latency; transfer them coherently or use a protocol that tolerates the skew. Keep CDC and STA clock/reset definitions consistent. Review clock groups, generated clocks, synchronizer placement, Gray-bus skew/max-delay requirements, reset paths, and justified waivers. A false path is a timing-analysis instruction, not evidence that a crossing is functionally safe.
1189	
1190	  - Distinguish setup and hold analysis and debug clock skew.
1191	
1192	    **Answer. **Setup checks whether the latest data arrival reaches the capture flip-flop before its setup deadline. Hold checks whether the earliest new data arrival stays away until after the hold deadline. Define skew as capture-clock arrival minus launch-clock arrival. Positive skew helps setup and hurts hold for a simple same-frequency path.
1193	
1194	    ```systemverilog
1195	    // Simplified same-frequency equations, ignoring uncertainty:
1196	    // Setup: T >= t_cq_max + t_data_max + t_setup - skew
1197	    // Hold:  t_cq_min + t_data_min >= t_hold + skew
1198	    ```
1199	
1200	    Debug using actual launch/capture edges, path delays, clock insertion delays, uncertainty, and variation. Setup fixes include shortening logic or adding a pipeline; hold fixes often add minimum data delay or adjust the clock tree. Increasing the clock period helps a simple setup failure but does not fix a same-edge hold failure. Multicycle exceptions need correct hold treatment too.
1201	
1202	  ### AXI / interconnect
1203	
1204	  - Explain AXI asynchronous crossing and two-master arbitration.
1205	
1206	    **Answer. **An AXI clock crossing needs transaction-aware buffering, commonly asynchronous FIFOs for channel payloads and their handshake state. Preserve AW, W, B, AR, and R information, outstanding IDs, burst boundaries, and write-address/data association. Synchronizing each AXI signal independently can corrupt a transaction.
1207	
1208	    For two masters targeting one slave, arbitrate accepted address requests, record ownership, and route responses to the correct master. Masters can reuse the same numeric ID, so append a source tag or maintain an ID mapping table. In AXI4, W has no WID and write-data interleaving is absent; keep each write burst associated with its selected address/owner and handle AW/W arriving independently. Test simultaneous masters, colliding IDs, backpressure on each channel, long bursts, fairness, reset, and unmatched address/data timing. Reference: [Arm AXI specification](https://developer.arm.com/documentation/ihi0022/latest/)
1209	
1210	  - Build and test master-to-slave address routing, fanout, and register slices.
1211	
1212	    **Answer. **Decode each accepted address against nonoverlapping slave regions and retain the selected destination for the transaction. Keep that route stable while the address stalls and while the burst completes. Return a decode error for unmapped addresses according to the interconnect contract. Response routing must preserve the original master and transaction identity.
1213	
1214	    Test both ends of every address region, adjacent regions, unmapped addresses, concurrent destinations, colliding IDs from different masters, all burst sizes/types supported, byte strobes, and independent channel stalls. AXI bursts must not cross a 4 KB boundary; also check any narrower target-region restrictions. For register slices, compare end-to-end accepted traffic to catch loss, duplication, sideband misalignment, and reordering. Check throughput and bubble behavior as well as correctness. Fanout must deliver a transaction only to its selected target unless a separate broadcast operation is specified. Reference: [Arm AXI specification](https://developer.arm.com/documentation/ihi0022/latest/)
1215	
1216	  - Compare same-ID versus different-ID outstanding requests and ordering implications.
1217	
1218	    **Answer. **AXI transaction IDs identify streams that have ordering requirements. For conventional AXI4, read responses for the same master and ID preserve request order; write responses for the same master and ID preserve write-transaction order. Different IDs can permit out-of-order completion, so the scoreboard tracks expected transactions by master, direction, and ID rather than using one global FIFO.
1219	
1220	    A single read burst's beats remain ordered and end with RLAST. Read and write directions are separate. Using the same numeric ID does not impose a universal ordering between a read and a write. Cross-direction dependencies require the specified completion/ordering mechanism. Check the specific AXI version and target memory attributes. Reference: [Arm AXI specification](https://developer.arm.com/documentation/ihi0022/latest/)
1221	
1222	  - Compare AXI and APB; explain split transactions.
1223	
1224	    **Answer. **AXI has independent read-address, read-data, write-address, write-data, and write-response channels. It supports pipelined traffic, bursts, and, in full AXI, multiple outstanding transactions identified by IDs. APB is a simpler peripheral interface with a setup phase followed by an access phase; it allows wait states but does not provide AXI-style multiple outstanding transactions or bursts.
1225	
1226	    APB starts setup with PSEL asserted and PENABLE low, then enters access with PENABLE high; completion occurs when PREADY is high. Address and control remain stable during a waited access. AXI decouples request acceptance from later completion, allowing other requests to proceed while a response is pending. That is often what an interviewer means by a split transaction, but AHB's named SPLIT response is a different protocol mechanism. In an AXI-to-APB bridge, verify serialization, address/data retention, byte strobes where supported, error translation, and backpressure. References: [Arm AXI specification](https://developer.arm.com/documentation/ihi0022/latest/) and [Arm APB specification](https://developer.arm.com/documentation/ihi0024/latest/)
1227	
1228	  - Analyze a reset during an in-flight AXI memory-mapped burst and potential hangs.
1229	
1230	    **Answer. **Reset can erase an accepted address, partial write data, or a pending response. If only one endpoint resets, the other may wait forever for a transaction whose state no longer exists. AXI reset requirements do not define a universal system-level recovery policy for every partially completed transaction, so the reset architecture must say which domains reset together and how abandoned requests are handled.
1231	
1232	    Test reset before address acceptance, after address acceptance, between write beats, before B, during read responses, and with channel backpressure. Check VALID outputs are cleared as required and reset deassertion follows the local clock rules. For a partial reset, use the specified quiesce, isolation, drain, abort/error, or coordinated-reset mechanism. Clear or reconcile ownership tables, FIFOs, credits, and scoreboards by reset epoch. Do not assume a partially written memory burst is atomic or that reset rolls back earlier writes. A bounded recovery/timeout check detects orphaned requests and hangs. Reference: [Arm AXI specification](https://developer.arm.com/documentation/ihi0022/latest/)
1233	
1234	+ ## Suggested revision order
1235	
1236	  1. UVM architecture and sequencer/driver/monitor protocols.
1237	
1238	  2. Constrained randomization, array reductions, distributions, and uniqueness.
1239	
1240	  3. FIFO and arbitration test plans, reference models, scoreboard, and coverage.
1241	
1242	  4. AXI valid/ready, outstanding transactions, arbitration, and backpressure.
1243	
1244	  5. CDC and STA fundamentals.
1245	
1246	  6. Python/C++ string processing, parsing, OOP, and basic coding problems.
1247	
1248	+ ## Source sections
1249	
1250	  - Design Verification overview and core test plans: https://www.hardware-interview.com/study
1251	
1252	  - UVM questions: same page, under **Design Verification > UVM**
1253	
1254	  - Constraint problems: same page, under **Design Verification > SystemVerilog Testbench & Constraints**
1255	
1256	  - Relevant supporting sections: **STA/Static Timing Analysis**, **Clock Domain Crossing**, and **Bus Interconnect Design**
1257	
1258	  Editorial note: Several sample answers on the original page are informal and may contain incomplete or questionable code. Treat them as interview prompts and verify syntax and semantics with a simulator and the UVM/SystemVerilog specification.
1259	
1260	+ ## LeetCode problems for DV/silicon validation
1261	
1262	  Source: [Hardware Interview study guide](https://www.hardware-interview.com/study), DV/Silicon Validation filter.
1263	
1264	  ### Bit manipulation
1265	
1266	  - [#136 Single Number](https://leetcode.com/problems/single-number/)
1267	
1268	  - [#137 Single Number II](https://leetcode.com/problems/single-number-ii/)
1269	
1270	  - [#190 Reverse Bits](https://leetcode.com/problems/reverse-bits/)
1271	
1272	  - [#191 Number of 1 Bits](https://leetcode.com/problems/number-of-1-bits/)
1273	
1274	  - [#201 Bitwise AND of Numbers Range](https://leetcode.com/problems/bitwise-and-of-numbers-range/)
1275	
1276	  - [#231 Power of Two](https://leetcode.com/problems/power-of-two/)
1277	
1278	  - [#260 Single Number III](https://leetcode.com/problems/single-number-iii/)
1279	
1280	  - [#268 Missing Number](https://leetcode.com/problems/missing-number/)
1281	
1282	  - [#287 Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/)
1283	
1284	  - [#318 Maximum Product of Word Lengths](https://leetcode.com/problems/maximum-product-of-word-lengths/)
1285	
1286	  - [#476 Number Complement](https://leetcode.com/problems/number-complement/)
1287	
1288	  ### Arrays and hash tables
1289	
1290	  - [#1 Two Sum](https://leetcode.com/problems/two-sum/)
1291	
1292	  - [#26 Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
1293	
1294	  - [#27 Remove Element](https://leetcode.com/problems/remove-element/)
1295	
1296	  - [#88 Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/)
1297	
1298	  - [#169 Majority Element](https://leetcode.com/problems/majority-element/)
1299	
1300	  - [#242 Valid Anagram](https://leetcode.com/problems/valid-anagram/)
1301	
1302	  - [#15 3Sum](https://leetcode.com/problems/3sum/)
1303	
1304	  - [#54 Spiral Matrix](https://leetcode.com/problems/spiral-matrix/)
1305	
1306	  ### Stacks and string processing
1307	
1308	  - [#13 Roman to Integer](https://leetcode.com/problems/roman-to-integer/)
1309	
1310	  - [#20 Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
1311	
1312	  ### Linked lists
1313	
1314	  - [#21 Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)
1315	
1316	  - [#83 Remove Duplicates from Sorted List](https://leetcode.com/problems/remove-duplicates-from-sorted-list/)
1317	
1318	  - [#141 Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/)
1319	
1320	  - [#160 Intersection of Two Linked Lists](https://leetcode.com/problems/intersection-of-two-linked-lists/)
1321	
1322	  - [#206 Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/)
1323	
1324	  ### Two pointers and binary search
1325	
1326	  - [#125 Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
1327	
1328	  - [#167 Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/)
1329	
1330	  - [#704 Binary Search](https://leetcode.com/problems/binary-search/)
1331	
1332	  - [#35 Search Insert Position](https://leetcode.com/problems/search-insert-position/)
1333	
1334	  ### Design problems
1335	
1336	  - [#155 Min Stack](https://leetcode.com/problems/min-stack/)
1337	
1338	  - [#225 Implement Stack using Queues](https://leetcode.com/problems/implement-stack-using-queues/)
1339	
1340	  - [#232 Implement Queue using Stacks](https://leetcode.com/problems/implement-queue-using-stacks/)
1341	
1342	  - [#705 Design HashSet](https://leetcode.com/problems/design-hashset/)
1343	
1344	  - [#706 Design HashMap](https://leetcode.com/problems/design-hashmap/)
1345	
1346	  - [#146 LRU Cache](https://leetcode.com/problems/lru-cache/)
1347	
1348	  ### Dynamic programming
1349	
1350	  - [#70 Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)
