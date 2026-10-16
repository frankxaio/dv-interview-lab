card "VLSIVerify Interview Question" [def906e8-5c38-4e5c-a207-64f3ef1dfcb2] 1067 lines
1	# VLSIVerify Interview Question
2	
3	Source: [VLSI Verify - UVM Interview Questions](https://vlsiverify.com/interview-questions/uvm-interview-questions/)
4	
5	A comprehensive collection of the **45 UVM Interview Questions and Answers** categorized into **Basic**, **Intermediate**, and **Difficult** levels. For questions that reference external tutorials on VLSI Verify, the reference link is preserved and accompanied by a comprehensive, interview-ready explanation and code snippet.
6	
7	---
8	
9	## Basic Level Questions
10	
11	### 1. Why do we need UVM methodology?
12	
13	The **Universal Verification Methodology (UVM)** is an IEEE standardized (IEEE 1800.2) methodology for verifying digital designs that facilitates developing reusable, modular, and well-structured verification testbenches.
14	
15	**Key Reasons & Benefits:**
16	
17	- **Reusability:** Provides a standardized class hierarchy (`uvm_driver`, `uvm_monitor`, `uvm_scoreboard`, `uvm_agent`, `uvm_env`) allowing verification components (UVCs) to be reused from block level to subsystem and SoC levels.
18	
19	- **Factory Mechanism:** Enables overriding components or transactions without modifying testbench code.
20	
21	- **Phasing Mechanism:** Standardizes testbench synchronization across components (`build`, `connect`, `run`, `check`, `report`), preventing race conditions.
22	
23	- **TLM (Transaction-Level Modeling):** Decouples communication between testbench components, making them modular and plug-and-play.
24	
25	- **Configuration Database (****`uvm_config_db`****):** Centralizes parameter and interface distribution across the testbench hierarchy.
26	
27	- **Multi-vendor Support:** Supported by all major EDA simulators (Synopsys, Cadence, Siemens/Mentor).
28	
29	---
30	
31	### 2. Difference between `uvm_object` and `uvm_component`
32	
33	*Refer: *[*Difference\_between\_uvm\_component\_and\_uvm\_object*](https://vlsiverify.com/uvm/uvm-class-hierarchy#Difference_between_uvm_component_and_uvm_object)
34	
35	| Feature | `uvm_object` | `uvm_component` |
36	| --- | --- | --- |
37	| **Inheritance** | Base class for all UVM data objects | Derived from `uvm_object` (via `uvm_report_object`) |
38	| **Nature / Lifetime** | **Transient / Dynamic**: Created and destroyed on the fly during simulation | **Quasi-static**: Created at elaboration/build phase and exists throughout simulation |
39	| **Hierarchy** | No parent-child hierarchy | Strict parent-child hierarchy (`name` and `parent` required) |
40	| **Constructor** | `function new(string name="uvm_object");` | `function new(string name, uvm_component parent);` |
41	| **Phases** | Does **not** participate in UVM phases | Executes standard UVM phases (`build_phase`, `connect_phase`, etc.) |
42	| **Examples** | `uvm_sequence_item`, `uvm_sequence`, configuration objects | `uvm_driver`, `uvm_monitor`, `uvm_sequencer`, `uvm_scoreboard`, `uvm_env`, `uvm_test` |
43	| **Registration** | Registered via `` `uvm_object_utils(T) `` | Registered via `` `uvm_component_utils(T) `` |
44	
45	---
46	
47	### 3. Difference between `uvm_transaction` and `uvm_sequence_item`
48	
49	- **`uvm_transaction`****:** Inherited from `uvm_object`. Adds basic timing, notification events, and transaction recording capabilities.
50	
51	- **`uvm_sequence_item`****:** Derived from `uvm_transaction`. Adds essential hooks and infrastructure for communicating with sequencers and drivers (e.g., `set_sequencer()`, `get_sequencer()`, `set_transaction_id()`, `get_transaction_id()`).
52	
53	- **Modern Recommendation:** `uvm_transaction` is considered **deprecated** as a base class for user stimulus. All user-defined transaction classes should extend `uvm_sequence_item`.
54	
55	---
56	
57	### 4. Difference between `create()` and `new()`
58	
59	- **`new()`**** Method:** The native SystemVerilog constructor. It instantiates the exact class type specified at compile time. It does **not** query or support the UVM factory override mechanism.
60	
61	- **`create()`**** Method:** A static factory method provided by the UVM factory registry wrapper (`type_id::create()`). When called, it queries the UVM factory table to check if any type or instance override has been configured (e.g., via `set_type_override_by_type` or `set_inst_override_by_type`). If an override exists, it constructs the derived/overridden class instead of the original class.
62	
63	- **Summary:** Always use `<class_type>::type_id::create("name", parent)` in UVM testbenches to preserve polymorphism and enable testbench configurability without code edits.
64	
65	---
66	
67	### 5. Difference between `copy()` and `clone()`
68	
69	*Refer: *[*copy-and-clone-methods-in-uvm*](https://vlsiverify.com/uvm/copy-and-clone-methods-in-uvm)
70	
71	- **`copy()`****:** Copies data fields from a source object into an **already allocated** destination object. It performs a deep copy of the fields.
72	
73	  ```systemverilog
74	  target_item = my_item::type_id::create("target_item");
75	  target_item.copy(source_item); // target_item must already exist
76	  ```
77	
78	- **`clone()`****:** First creates a new object using `create()`, and then internally calls `copy()` to duplicate the fields. It returns a handle of type `uvm_object`, which requires `$cast` into the target class handle.
79	
80	  ```systemverilog
81	  $cast(target_item, source_item.clone()); // Allocates and copies in one step
82	  ```
83	
84	---
85	
86	### 6. Difference between `uvm_resource_db` and `uvm_config_db`
87	
88	*Refer: *[*Difference\_between\_uvm\_config\_db\_and\_uvm\_resource\_db*](https://vlsiverify.com/uvm/uvm_config_db-in-uvm#Difference_between_uvm_config_db_and_uvm_resource_db)
89	
90	| Feature | `uvm_resource_db` | `uvm_config_db` |
91	| --- | --- | --- |
92	| **Relationship** | The underlying core database engine in UVM | A layered convenience API built on top of `uvm_resource_db` |
93	| **Lookup Mechanism** | String name lookup or type lookup (supports regex) | Hierarchical context + scope + field name lookup |
94	| **Precedence Resolution** | **Last write wins**: If two writes occur to the same key, the later one wins regardless of hierarchy | **Hierarchical precedence**: Higher-level components in the hierarchy (e.g., test or env) have higher precedence over lower-level components during `build_phase` |
95	| **Typical Usage** | Low-level resource sharing without hierarchical scoping | Standard UVM method for passing virtual interfaces, configuration objects, and knobs |
96	
97	---
98	
99	### 7. What is severity and verbosity in UVM?
100	
101	Severity and verbosity control reporting and message filtering in UVM.
102	
103	**1. Severity Levels (****`uvm_severity`****):** Indicates the criticality of a message:
104	
105	- `UVM_INFO`: Informational message indicating simulation milestones or variable values.
106	
107	- `UVM_WARNING`: Indicates non-fatal unexpected conditions that may require attention.
108	
109	- `UVM_ERROR`: Indicates a verification failure (e.g., scoreboard mismatch, protocol violation). Simulation continues by default.
110	
111	- `UVM_FATAL`: Indicates an unrecoverable failure. Terminates simulation immediately (`UVM_EXIT`).
112	
113	**2. Verbosity Levels (****`uvm_verbosity`****):** Filters informational messages (`UVM_INFO`):
114	
115	- `UVM_NONE` (0): Always printed; cannot be filtered out.
116	
117	- `UVM_LOW` (100): High-level milestone messages.
118	
119	- `UVM_MEDIUM` (200): Default verbosity level; standard progress reports.
120	
121	- `UVM_HIGH` (300): Detailed debugging messages.
122	
123	- `UVM_FULL` (400): Maximum verbosity (e.g., full transaction dumps).
124	
125	- `UVM_DEBUG` (500): Granular step-by-step debug traces.
126	
127	*Filter Rule:* A message is printed if `message_verbosity <= component_verbosity_threshold`.
128	
129	---
130	
131	### 8. Difference between `sequence` and `sequencer`
132	
133	*Refer: *[*uvm-sequence*](https://vlsiverify.com/uvm/uvm-sequence)* and *[*uvm-sequencer*](https://vlsiverify.com/uvm/uvm-sequencer)
134	
135	- **`uvm_sequence`****:**
136	
137	  - A transient object extending `uvm_sequence_base` (`uvm_object`).
138	
139	  - Contains procedural logic, generation algorithms, and timing flows to create stimulus transactions (`sequence_item`).
140	
141	  - Not bound to the structural hierarchy; can call sub-sequences.
142	
143	- **`uvm_sequencer`****:**
144	
145	  - A quasi-static structural component extending `uvm_sequencer_base` (`uvm_component`).
146	
147	  - Acts as an arbiter and buffer between multiple running sequences and the driver.
148	
149	  - Receives transaction requests from sequences via `start_item()` / `finish_item()` and forwards them to the driver via TLM `seq_item_export`.
150	
151	---
152	
153	### 9. How to run any test case in UVM?
154	
155	*Refer: *[*Execution\_of\_the\_test*](https://vlsiverify.com/uvm/uvm-test#Execution_of_the_test)
156	
157	There are two primary ways to run a test case in UVM:
158	
159	1. **Explicitly in Top Module:**
160	   Hardcoding the test name in the top testbench module:
161	
162	   ```systemverilog
163	   initial begin
164	     run_test("my_custom_test");
165	   end
166	   ```
167	
168	2. **Via Command-Line Plusarg (Industry Standard):**
169	   Calling `run_test()` without an argument in `tb_top`, and supplying the test name at runtime:
170	
171	   ```systemverilog
172	   initial begin
173	     run_test(); // No argument passed
174	   end
175	   ```
176	
177	   Command line invocation:
178	
179	   ```bash
180	   <simulator_run_command> +UVM_TESTNAME=my_custom_test
181	   ```
182	
183	   *Advantage:* The testbench is compiled once, and any test can be run without recompilation.
184	
185	---
186	
187	### 10. Write a simple UVM sequence template and explain each line
188	
189	*Refer: *[*uvm\_sequence\_class\_structure*](https://vlsiverify.com/uvm/uvm-sequence#uvm_sequence_class_structure)
190	
191	```systemverilog
192	class my_sequence extends uvm_sequence #(my_seq_item);
193	  // 1. Factory registration for uvm_object
194	  `uvm_object_utils(my_sequence)
195	
196	  // 2. Standard uvm_object constructor
197	  function new(string name = "my_sequence");
198	    super.new(name);
199	  endfunction
200	
201	  // 3. Main execution task defining the stimulus sequence
202	  virtual task body();
203	    my_seq_item req;
204	
205	    // 4. Create sequence item using UVM factory
206	    req = my_seq_item::type_id::create("req");
207	
208	    // 5. Request sequencer access and wait for driver grant
209	    start_item(req);
210	
211	    // 6. Randomize item with optional inline constraints
212	    if (!req.randomize() with { addr inside {[0:32'hFF]}; }) begin
213	      `uvm_error(get_type_name(), "Randomization failed")
214	    end
215	
216	    // 7. Send item to driver and block until driver signals item_done()
217	    finish_item(req);
218	  endtask
219	endclass
220	```
221	
222	**Step-by-step breakdown:**
223	
224	1. `uvm_sequence #(my_seq_item)`: Parameterizes the sequence with the specific item type to provide typed handles `req` and `rsp`.
225	
226	2. `` `uvm_object_utils ``: Enables factory creation and override mechanisms.
227	
228	3. `start_item(req)`: Interacts with the sequencer, arbitrates among concurrent sequences, and waits until the driver is ready.
229	
230	4. `randomize()`: Performed *after* `start_item` so late-randomization constraints can evaluate current state.
231	
232	5. `finish_item(req)`: Hands the transaction over to the driver and suspends until the driver completes handshake (`item_done()`).
233	
234	---
235	
236	### 11. How is scoreboard connected to different components?
237	
238	The **UVM Scoreboard** receives transactions from monitors using TLM analysis ports and analysis exports/FIFOs:
239	
240	1. **Direct Connection via ****`uvm_analysis_imp`****:**
241	   The scoreboard declares an analysis implementation port (`uvm_analysis_imp #(item, scoreboard)`). In the `connect_phase` of the enclosing environment:
242	
243	   ```systemverilog
244	   monitor.item_collected_port.connect(scoreboard.item_imp);
245	   ```
246	
247	   The scoreboard must implement the `write(item t)` function.
248	
249	2. **Connection via ****`uvm_tlm_analysis_fifo`**** (Recommended for multi-input scoreboards):**
250	   When comparing transactions from multiple monitors (e.g., ingress and egress), direct `write()` calls may create timing race conditions. Using TLM FIFOs decouples them:
251	
252	   ```systemverilog
253	   // In env connect_phase:
254	   in_mon.item_port.connect(scb.in_fifo.analysis_export);
255	   out_mon.item_port.connect(scb.out_fifo.analysis_export);
256	   ```
257	
258	   The scoreboard's `run_phase` can then independently `get()` from both FIFOs and compare results.
259	
260	---
261	
262	## Intermediate Level Questions
263	
264	### 1. What is the UVM factory and what is its use?
265	
266	The **UVM Factory** is a centralized object-creational registry based on the Factory Design Pattern.
267	
268	**Key Uses:**
269	
270	- Replaces direct constructor calls (`new()`) with polymorphic creation (`create()`).
271	
272	- Allows replacing an object or component type with a derived type across the entire testbench (`set_type_override_by_type`) or for a specific instance path (`set_inst_override_by_type`) without editing existing testbench code.
273	
274	- Essential for error injection tests, alternative protocol variations, and extending verification components.
275	
276	---
277	
278	### 2. Why phases are introduced in UVM? What are all phases present in UVM?
279	
280	*Refer: *[*uvm-phases*](https://vlsiverify.com/uvm/uvm-phases)
281	
282	**Why introduced:**
283	In traditional Verilog/SystemVerilog testbenches, components operated concurrently in unrestricted `initial` blocks, leading to race conditions during initialization, configuration, execution, and shutdown. UVM introduces structured phases to ensure all components transition synchronously through a deterministic lifecycle.
284	
285	**Phases Present in UVM:**
286	
287	1. **Build Phases (Functions - 0 simulation time, top-down):**
288	
289	   - `build_phase`: Constructs components and distributes configurations.
290	
291	   - `connect_phase`: Connects TLM ports and exports (bottom-up).
292	
293	   - `end_of_elaboration_phase`: Finalizes topology and adjustments.
294	
295	   - `start_of_simulation_phase`: Pre-run prints, banner display, and setup.
296	
297	2. **Run Phase (Tasks - time-consuming, parallel):**
298	
299	   - `run_phase`: Spans the active simulation time alongside 12 synchronized sub-phases:
300	
301	     - *Reset:* `pre_reset` \$	o\$ `reset` \$	o\$ `post_reset`
302	
303	     - *Configure:* `pre_configure` \$	o\$ `configure` \$	o\$ `post_configure`
304	
305	     - *Main (Stimulus):* `pre_main` \$	o\$ `main` \$	o\$ `post_main`
306	
307	     - *Shutdown:* `pre_shutdown` \$	o\$ `shutdown` \$	o\$ `post_shutdown`
308	
309	3. **Cleanup Phases (Functions - 0 simulation time, bottom-up):**
310	
311	   - `extract_phase`: Gathers state and counters.
312	
313	   - `check_phase`: Validates that no transactions were dropped and checkers passed.
314	
315	   - `report_phase`: Summarizes test results, pass/fail status, and coverage.
316	
317	   - `final_phase`: Last-minute file closures and cleanups.
318	
319	---
320	
321	### 3. What approach does `build_phase` use and why?
322	
323	`build_phase` uses a **top-down** approach.
324	
325	**Reason:**
326	A parent component (e.g., `uvm_test` or `uvm_env`) must be instantiated and configured first before it can determine what child components (e.g., agents, scoreboards, drivers, monitors) are needed and instantiate them. Furthermore, configuration settings and virtual interfaces pushed into `uvm_config_db` by the parent must be available when child components build themselves.
327	
328	---
329	
330	### 4. Draw and explain the verification environment in UVM
331	
332	*Refer: *[*uvm-testbench-top*](https://vlsiverify.com/uvm/uvm-testbench-top)
333	
334	```
335	+------------------------------------------------------------------------+
336	|                               tb_top                                   |
337	|  +--------------------+                     +-----------------------+  |
338	|  |     DUT Instance   |<=== Interface ====>| Virtual Interface (vif)|  |
339	|  +--------------------+                     +-----------+-----------+  |
340	|                                                         |              |
341	|  +------------------------------------------------------+-----------+  |
342	|  | uvm_test_top (uvm_test)                                          |  |
343	|  |   +------------------------------------------------------------+ |  |
344	|  |   | uvm_env                                                    | |  |
345	|  |   |  +-------------------------------------+  +--------------+ | |  |
346	|  |   |  | uvm_agent                           |  | Scoreboard   | | |  |
347	|  |   |  |  +-----------+     +------------+   |  |  (Checker &  | | |  |
348	|  |   |  |  | Sequencer |<--->|   Driver   |===|==> Reference    | | |  |
349	|  |   |  |  +-----------+     +------------+   |  |    Model)    | | |  |
350	|  |   |  |                         | (vif)     |  +-------^------+ | |  |
351	|  |   |  |                    +----+-------+   |          |        | |  |
352	|  |   |  |                    |  Monitor   |===|==========+        | |  |
353	|  |   |  |                    +------------+   |  +-------v------+ | |  |
354	|  |   |  +-------------------------------------+  | Coverage     | | |  |
355	|  |   |                                           | Collector    | | |  |
356	|  |   |                                           +--------------+ | |  |
357	|  |   +------------------------------------------------------------+ |  |
358	|  +------------------------------------------------------------------+  |
359	+------------------------------------------------------------------------+
360	```
361	
362	**Component Breakdown:**
363	
364	- **`tb_top`****:** Top SV module; instantiates DUT, interfaces, clock/reset generators, and calls `run_test()`.
365	
366	- **`uvm_test`****:** Configures environment topology, test-specific parameters, and selects default sequences.
367	
368	- **`uvm_env`****:** Encapsulates sub-environments, agents, scoreboards, and coverage collectors.
369	
370	- **`uvm_agent`****:** Groups protocol-specific components:
371	
372	  - *Sequencer:* Controls sequence execution and arbitrates items.
373	
374	  - *Driver:* Converts sequence items to signal-level activity on the interface.
375	
376	  - *Monitor:* Samples interface signals and converts pin activity into transaction objects.
377	
378	- **`uvm_scoreboard`****:** Compares DUT outputs against expected outputs from an integrated reference model.
379	
380	- **`Coverage Collector`****:** Measures functional coverage points from sampled transactions.
381	
382	---
383	
384	### 5. What all UVM phases take time?
385	
386	Only **task-based** phases consume simulation time:
387	
388	- `run_phase` (spans the entire active simulation duration).
389	
390	- The 12 runtime sub-phases:
391	
392	  - `pre_reset_phase`, `reset_phase`, `post_reset_phase`
393	
394	  - `pre_configure_phase`, `configure_phase`, `post_configure_phase`
395	
396	  - `pre_main_phase`, `main_phase`, `post_main_phase`
397	
398	  - `pre_shutdown_phase`, `shutdown_phase`, `post_shutdown_phase`
399	
400	*All other phases (**`build`**, **`connect`**, **`check`**, **`report`**, etc.) are functions and execute in zero simulation time.*
401	
402	---
403	
404	### 6. What all phases are functions and tasks in UVM?
405	
406	*Refer: *[*How\_does\_UVM\_phase\_execution\_start*](https://vlsiverify.com/uvm/uvm-phases#How_does_UVM_phase_execution_start)
407	
408	- **Function Phases (Zero Simulation Time):**
409	
410	  - `build_phase(uvm_phase phase)`
411	
412	  - `connect_phase(uvm_phase phase)`
413	
414	  - `end_of_elaboration_phase(uvm_phase phase)`
415	
416	  - `start_of_simulation_phase(uvm_phase phase)`
417	
418	  - `extract_phase(uvm_phase phase)`
419	
420	  - `check_phase(uvm_phase phase)`
421	
422	  - `report_phase(uvm_phase phase)`
423	
424	  - `final_phase(uvm_phase phase)`
425	
426	- **Task Phases (Time-Consuming):**
427	
428	  - `run_phase(uvm_phase phase)`
429	
430	  - All 12 runtime sub-phases (`reset`, `configure`, `main`, `shutdown`, and their `pre`/`post` counterparts).
431	
432	---
433	
434	### 7. Why do we use the `super` keyword in phases like `super.build_phase`, `super.main_phase` etc.?
435	
436	- The `super` keyword calls the base class implementation of the method.
437	
438	- In `build_phase`, calling `super.build_phase(phase)` executes `uvm_component::build_phase`, which automatically unpacks and assigns values from the `uvm_config_db` for fields registered with `uvm_field_*` macros.
439	
440	- In other phases, it ensures any base-class behavior or safety checks are preserved.
441	
442	---
443	
444	### 8. Difference between `` `uvm_do `` and `` `uvm_rand_send ``
445	
446	*Refer: *[*uvm\_do\_example*](https://vlsiverify.com/uvm/uvm-sequence-macros#uvm_do_example)* and *[*uvm\_rand\_send\_example*](https://vlsiverify.com/uvm/uvm-sequence-macros#uvm_rand_send_example)
447	
448	- **`` `uvm_do(item/seq) ``****:**
449	  Carries out the full item lifecycle:
450	
451	  1. Creates the item using factory (`type_id::create()`).
452	
453	  2. Calls `start_item()`.
454	
455	  3. Randomizes the item (`randomize()`).
456	
457	  4. Calls `finish_item()`.
458	
459	- **`` `uvm_rand_send(item/seq) ``****:**
460	  Requires the item to **already be created/allocated**.
461	
462	  1. Calls `start_item()`.
463	
464	  2. Randomizes the item (`randomize()`).
465	
466	  3. Calls `finish_item()`.
467	     *(Does not create the object).*
468	
469	---
470	
471	### 9. What are bottom-up and top-down approaches in UVM phases?
472	
473	*Refer: *[*uvm-phases*](https://vlsiverify.com/uvm/uvm-phases)
474	
475	- **Top-Down Approach:**
476	
477	  - Parent components execute before child components.
478	
479	  - Used in: `build_phase`. (Parent must exist to instantiate and configure its children).
480	
481	- **Bottom-Up Approach:**
482	
483	  - Child components execute before their parent.
484	
485	  - Used in: `connect_phase`, `end_of_elaboration_phase`, `start_of_simulation_phase`, `extract_phase`, `check_phase`, `report_phase`, and `final_phase`. (Subcomponents must finalize connections and check status before the parent aggregates them).
486	
487	---
488	
489	### 10. How do `uvm_config_db` set/get work?
490	
491	*Refer: *[*uvm\_config\_db-in-uvm*](https://vlsiverify.com/uvm/uvm_config_db-in-uvm)
492	
493	The `uvm_config_db` is a type-parameterized configuration database providing a centralized mechanism to store and retrieve parameters, configuration objects, and virtual interface handles across the UVM hierarchy.
494	
495	#### 1. Syntax
496	
497	```systemverilog
498	// Set method:
499	uvm_config_db #(TYPE)::set(uvm_component cntxt, string inst_name, string field_name, TYPE value);
500	
501	// Get method:
502	uvm_config_db #(TYPE)::get(uvm_component cntxt, string inst_name, string field_name, ref TYPE value);
503	```
504	
505	#### 2. Arguments Breakdown
506	
507	- `cntxt`: The contextual component performing the set/get (usually `this` inside components, or `null` in `tb_top` / top module).
508	
509	- `inst_name`: Relative hierarchical path matching target component instance(s). Can use wildcards (e.g., `"uvm_test_top.env.agent.*"`).
510	
511	- `field_name`: Key/identifier string for the lookup.
512	
513	- `value`: Variable holding the value being written (`set`) or read (`get`).
514	
515	#### 3. Execution & Precedence Rules
516	
517	- **Lookup Key:** Internally forms a lookup tuple combining context hierarchy, `inst_name`, and `field_name`.
518	
519	- **Hierarchical Precedence in ****`build_phase`****:** If multiple `set()` calls target the same variable, **the component higher up in the hierarchy wins** (e.g., a setting in `test` overrides a setting in `env`).
520	
521	- **Same-level Precedence:** If two `set()` calls occur at the same hierarchical level, the **last write wins**.
522	
523	- **Return Value of ****`get()`****:** Returns `1` (true) on successful retrieval, `0` (false) if lookup fails or type mismatch occurs.
524	
525	#### 4. Common Example: Virtual Interface Binding
526	
527	```systemverilog
528	// In tb_top:
529	initial begin
530	  uvm_config_db #(virtual dut_if)::set(null, "uvm_test_top*", "vif", vif);
531	  run_test();
532	end
533	
534	// In driver build_phase:
535	virtual function void build_phase(uvm_phase phase);
536	  super.build_phase(phase);
537	  if (!uvm_config_db #(virtual dut_if)::get(this, "", "vif", vif)) begin
538	    `uvm_fatal("NO_VIF", "Virtual interface not found in uvm_config_db")
539	  end
540	endfunction
541	```
542	
543	---
544	
545	### 11. What is an analysis port?
546	
547	*Refer: *[*tlm\_analysis\_port\_example*](https://vlsiverify.com/uvm/tlm/tlm-analysis-interface#tlm_analysis_port_example)
548	
549	The `uvm_analysis_port #(T)` is a TLM-based communication channel that implements a **broadcast** (1-to-many or 1-to-0) pattern.
550	
551	**Key Characteristics:**
552	
553	- **Non-blocking ****`write()`****:** Calling `ap.write(t)` is a function call that executes immediately without consuming simulation time.
554	
555	- **Flexible Fan-out:** Can be connected to zero, one, or multiple subscribers (scoreboards, coverage collectors, loggers).
556	
557	- If no subscribers are connected, calling `write()` safely does nothing without error.
558	
559	---
560	
561	### 12. What are `pre_body` and `post_body` used in sequence?
562	
563	*Refer: *[*start-a-sequence*](https://vlsiverify.com/uvm/start-a-sequence)
564	
565	- `pre_body()` and `post_body()` are user-definable callback tasks in `uvm_sequence_base`.
566	
567	- `pre_body()` executes immediately before `body()`.
568	
569	- `post_body()` executes immediately after `body()`.
570	
571	- **Critical Distinction:** They are called **only** when the sequence is started via `seq.start()`. They are **skipped** when the sequence is invoked via `` `uvm_do `` macros.
572	
573	- Historically used to raise/drop objections, though modern best practice prefers managing objections in tests or virtual sequences.
574	
575	---
576	
577	### 13. What is an active and passive agent?
578	
579	- **Active Agent (****`is_active = UVM_ACTIVE`****):**
580	
581	  - Actively drives stimulus onto the DUT pins.
582	
583	  - Instantiates **sequencer**, **driver**, and **monitor**.
584	
585	- **Passive Agent (****`is_active = UVM_PASSIVE`****):**
586	
587	  - Passively observes DUT signals without driving anything.
588	
589	  - Instantiates **only the monitor**.
590	
591	  - Used for monitoring DUT output interfaces, or when verifying an SoC subsystem where another master IP drives the bus.
592	
593	---
594	
595	### 14. Difference between UVM subscriber and UVM scoreboard
596	
597	*Refer: *[*uvm-subscriber*](https://vlsiverify.com/uvm/uvm-subscriber)* and *[*uvm-scoreboard*](https://vlsiverify.com/uvm/uvm-scoreboard)
598	
599	- **`uvm_subscriber #(T)`****:**
600	
601	  - A specialized `uvm_component` designed as a convenient single-input consumer.
602	
603	  - Comes with a built-in `uvm_analysis_imp` named `analysis_export` and defines a pure virtual `function void write(T t)`.
604	
605	  - Primarily used for simple listeners, such as **coverage collectors**.
606	
607	- **`uvm_scoreboard`****:**
608	
609	  - Extends `uvm_component` directly.
610	
611	  - Designed for complex verification checking; typically instantiates multiple analysis ports, exports, or TLM FIFOs (e.g., input monitor stream vs output monitor stream).
612	
613	  - Implements reference models, golden data predictors, queues/associative arrays, and data comparison logic.
614	
615	---
616	
617	### 15. What is UVM objection and why do we need it?
618	
619	*Refer: *[*uvm-objections*](https://vlsiverify.com/uvm/uvm-objections)
620	
621	UVM Objections provide a standardized mechanism to coordinate the **end of simulation** in time-consuming phases (chiefly `run_phase`).
622	
623	**How It Works:**
624	
625	- Components/sequences raise an objection when starting an activity: `phase.raise_objection(this);`
626	
627	- They drop the objection when the activity completes: `phase.drop_objection(this);`
628	
629	- As long as the global objection count is $> 0$, the phase remains active.
630	
631	- When all objections drop to $0$, UVM begins phase teardown (after an optional `set_drain_time()`) and advances to the cleanup phases (`extract`, `check`, `report`).
632	
633	---
634	
635	### 16. What are the different ways of exiting code execution?
636	
637	1. **UVM Objections (Graceful & Recommended):** Dropping all objections allows UVM to finish the `run_phase` and proceed through `extract_phase`, `check_phase`, and `report_phase` to generate clean pass/fail summaries.
638	
639	2. **`$finish`**** System Task:** Abruptly halts the simulator. Bypasses remaining UVM cleanup and reporting phases unless wrapped in specialized handlers.
640	
641	3. **`uvm_fatal`**** / ****`uvm_report_fatal`****:** Triggers `UVM_EXIT` action upon encountering an unrecoverable failure, exiting immediately.
642	
643	4. **Phase Timeout (****`set_timeout`****):** Configured via `uvm_root::get().set_timeout(time)` to automatically terminate execution if a runaway sequence or deadlock prevents objections from dropping.
644	
645	---
646	
647	### 17. What is a sequence item in UVM?
648	
649	*Refer: *[*sequence-items-in-uvm*](https://vlsiverify.com/uvm/sequence-items-in-uvm)
650	
651	A **sequence item** (`uvm_sequence_item`) is the fundamental transaction object representing data exchanged between testbench components and the DUT at an abstracted protocol level (e.g., packet, bus cycle, frame).
652	
653	**Contents:**
654	
655	- Random variables (`rand bit [31:0] addr, data;`) representing pin-level stimulus fields.
656	
657	- Protocol constraints and knobs.
658	
659	- Utility automation macros (`` `uvm_field_* ``) or manual overrides for `do_copy()`, `do_compare()`, `do_print()`, and `do_pack()`.
660	
661	- Sequence/sequencer routing identifiers (`transaction_id`).
662	
663	---
664	
665	### 18. Explain how the sequence starts
666	
667	*Refer: *[*start-a-sequence*](https://vlsiverify.com/uvm/start-a-sequence)
668	
669	A sequence is started by invoking its `start()` method:
670	
671	```systemverilog
672	seq.start(m_sequencer, parent_sequence, priority, call_pre_post_body);
673	```
674	
675	**Internal Execution Sequence:**
676	
677	1. Sets the sequencer handle (`m_sequencer`).
678	
679	2. Calls `pre_start()`.
680	
681	3. Calls `pre_body()` (if `call_pre_post_body == 1`).
682	
683	4. Executes the user's `body()` task (stimulus generation).
684	
685	5. Calls `post_body()` (if `call_pre_post_body == 1`).
686	
687	6. Calls `post_start()`.
688	
689	7. Once `body()` and all handshakes with the driver conclude, `start()` unblocks and returns.
690	
691	---
692	
693	### 19. How do sequence, driver, and sequencer communicate?
694	
695	*Refer: *[*sequence-driver-sequencer-communication-in-uvm*](https://vlsiverify.com/uvm/sequence-driver-sequencer-communication-in-uvm)
696	
697	Communication follows a bi-directional request-response TLM handshake:
698	
699	```
700	Sequence                 Sequencer                 Driver
701	   |                         |                       |
702	   |-- start_item(req) ----->|                       |
703	   |   (requests grant)      |                       |
704	   |                         |<-- get_next_item(req)-|
705	   |                         |    (driver ready)     |
706	   |<- grants sequence ------|                       |
707	   |                         |                       |
708	   | [Late Randomization]    |                       |
709	   |-- finish_item(req) ---->|===> forwards req ====>|
710	   |   (sends item)          |                       |
711	   |   (blocks waiting)      |                       | [Pin Wiggling]
712	   |                         |                       |
713	   |                         |<-- item_done() -------|
714	   |<- unblocks finish_item -|                       |
715	```
716	
717	1. **`start_item(req)`****:** Sequence requests permission from sequencer.
718	
719	2. **`get_next_item(req)`****:** Driver indicates it is ready for the next transaction. Sequencer arbitrates among competing sequences and grants access.
720	
721	3. **Randomization:** Sequence randomizes `req` with late state information.
722	
723	4. **`finish_item(req)`****:** Sequence passes `req` through the sequencer to the driver and suspends.
724	
725	5. **Driver execution:** Driver translates transaction fields to interface pin signals.
726	
727	6. **`item_done()`****:** Driver notifies sequencer that item execution is complete, unblocking `finish_item()` in the sequence.
728	
729	---
730	
731	### 20. What are lock and grab methods?
732	
733	*Refer: *[*lock-and-grab-methods-in-uvm-sequencer*](https://vlsiverify.com/uvm/lock-and-grab-methods-in-uvm-sequencer)
734	
735	Both methods allow a sequence to request exclusive ownership of a sequencer, preventing other sequences from interleaving transactions:
736	
737	- **`lock(sequencer)`****:** Places an arbitration lock request into the sequencer's queue. It waits politely until all previously queued sequence items ahead of it finish. Once granted, no other sequence can access the sequencer until `unlock()` is called.
738	
739	- **`grab(sequencer)`****:** An aggressive, highest-priority lock. It takes effect immediately after the currently executing item finishes, jumping ahead of all other waiting sequences in the queue. Remains in effect until `ungrab()` is called.
740	
741	---
742	
743	### 21. What is the RAL model and its application?
744	
745	The **Register Abstraction Layer (RAL)** provides an object-oriented representation of the DUT’s memory-mapped registers, register files, and memories.
746	
747	**Key Applications:**
748	
749	- **Named Access:** Read and write registers and fields by name (e.g., `regmodel.ctrl_reg.enable.write(status, 1)`) without hardcoding physical memory addresses.
750	
751	- **Mirroring:** Automatically tracks desired values vs mirrored values (what hardware actually holds).
752	
753	- **Pre-built Verification Sequences:** Includes turnkey UVM library sequences:
754	
755	  - Reset check (`uvm_reg_hw_reset_seq`)
756	
757	  - Bit-bash / walk 1s and 0s (`uvm_reg_bit_bash_seq`)
758	
759	  - Register access check (`uvm_reg_access_seq`)
760	
761	- **Functional Coverage:** Automatically generates register coverage models.
762	
763	---
764	
765	### 22. What do you mean by front-door and back-door register access?
766	
767	- **Front-Door Access:**
768	
769	  - Accesses registers through the DUT's physical bus interface (e.g., APB, AXI).
770	
771	  - Uses the driver to wiggle physical interface signals.
772	
773	  - Consumes simulation time.
774	
775	  - Verifies bus protocol, address decoders, and bus fabric.
776	
777	- **Back-Door Access:**
778	
779	  - Accesses registers directly using simulator DPI / HDL hierarchal register signal paths (`uvm_hdl_read` / `uvm_hdl_deposit`).
780	
781	  - Bypasses physical bus logic.
782	
783	  - Consumes **zero simulation time**.
784	
785	  - Useful for fast register preloading during bring-up and sanity checking.
786	
787	---
788	
789	### 23. What is TLM?
790	
791	*Refer: *[*transaction-level-modeling-tlm*](https://vlsiverify.com/uvm/tlm/transaction-level-modeling-tlm)
792	
793	**Transaction-Level Modeling (TLM)** is a standard modeling paradigm that abstracts signal-level communication (clocks, wires, handshakes) into discrete transaction objects.
794	
795	**Key Features:**
796	
797	- Standard ports (`uvm_blocking_put_port`, `uvm_nonblocking_get_port`, `uvm_analysis_port`).
798	
799	- Standard interfaces: `put`, `get`, `peek`, `transport`, `write`.
800	
801	- Decouples component implementation from communication transport, allowing modular testbench composition and SystemC integration.
802	
803	---
804	
805	### 24. What is TLM FIFO?
806	
807	*Refer: *[*tlm-fifo*](https://vlsiverify.com/uvm/tlm/tlm-fifo)
808	
809	A **`uvm_tlm_fifo #(T)`** is a transaction storage component that sits between an independent producer and consumer:
810	
811	- Provides an internal storage queue of configurable depth.
812	
813	- Exposes `put_export` on one side and `get_export` on the other.
814	
815	- Decouples timing: A producer can push items (`put`) without waiting for the consumer, and a consumer can retrieve items (`get`) whenever ready.
816	
817	- **`uvm_tlm_analysis_fifo #(T)`****:** Extends `uvm_tlm_fifo` with an `analysis_export` on the write side, making it ideal for scoreboards to receive non-blocking broadcast items from monitors.
818	
819	---
820	
821	### 25. What is `run_test`?
822	
823	*Refer: *[*run\_test\_task*](https://vlsiverify.com/uvm/uvm-test#run_test_task)
824	
825	`run_test` is a globally available UVM task defined in `uvm_globals.svh`:
826	
827	1. Initializes the UVM phase engine and retrieves the `uvm_root` (`uvm_top`) singleton instance.
828	
829	2. Checks if a test name was passed as an argument; if not, checks the command-line plusarg `+UVM_TESTNAME=<test_name>`.
830	
831	3. Instantiates the selected test class via the factory as `uvm_test_top`.
832	
833	4. Starts stepping through the UVM phase execution graph beginning with `build_phase`.
834	
835	---
836	
837	### 26. Explain generalized code structure for UVM monitor and scoreboard
838	
839	*Refer: *[*UVM\_Monitor\_Example*](https://vlsiverify.com/uvm/uvm-monitor#UVM_Monitor_Example)* and *[*Scoreboard\_Example*](https://vlsiverify.com/uvm/uvm-scoreboard#Scoreboard_Example)
840	
841	**1. Generalized Monitor Structure:**
842	
843	```systemverilog
844	class my_monitor extends uvm_monitor;
845	  `uvm_component_utils(my_monitor)
846	
847	  virtual dut_if vif;
848	  uvm_analysis_port #(my_item) item_port;
849	
850	  function new(string name, uvm_component parent);
851	    super.new(name, parent);
852	    item_port = new("item_port", this);
853	  endfunction
854	
855	  virtual function void build_phase(uvm_phase phase);
856	    super.build_phase(phase);
857	    uvm_config_db#(virtual dut_if)::get(this, "", "vif", vif);
858	  endfunction
859	
860	  virtual task run_phase(uvm_phase phase);
861	    forever begin
862	      my_item item = my_item::type_id::create("item");
863	      // Sample pins on clock edge
864	      @(posedge vif.clk iff vif.valid && vif.ready);
865	      item.data = vif.data;
866	      item.addr = vif.addr;
867	      // Broadcast transaction
868	      item_port.write(item);
869	    end
870	  endtask
871	endclass
872	```
873	
874	**2. Generalized Scoreboard Structure:**
875	
876	```systemverilog
877	class my_scoreboard extends uvm_scoreboard;
878	  `uvm_component_utils(my_scoreboard)
879	
880	  // Use TLM analysis exports with analysis imp
881	  `uvm_analysis_imp_decl(_in)
882	  `uvm_analysis_imp_decl(_out)
883	
884	  uvm_analysis_imp_in  #(my_item, my_scoreboard) in_imp;
885	  uvm_analysis_imp_out #(my_item, my_scoreboard) out_imp;
886	
887	  my_item exp_queue[$];
888	
889	  function new(string name, uvm_component parent);
890	    super.new(name, parent);
891	    in_imp  = new("in_imp", this);
892	    out_imp = new("out_imp", this);
893	  endfunction
894	
895	  virtual function void write_in(my_item item);
896	    // Push expected transaction into queue
897	    exp_queue.push_back(item);
898	  endfunction
899	
900	  virtual function void write_out(my_item act_item);
901	    my_item exp_item;
902	    if (exp_queue.size() == 0) begin
903	      `uvm_error("SCB", "Unexpected output packet received!")
904	      return;
905	    end
906	    exp_item = exp_queue.pop_front();
907	    if (!act_item.compare(exp_item)) begin
908	      `uvm_error("SCB", "Data mismatch detected!")
909	    end
910	  endfunction
911	endclass
912	```
913	
914	---
915	
916	### 27. What is an in-order and out-of-order scoreboard?
917	
918	*Refer: *[*UVM\_Scoreboad\_types*](https://vlsiverify.com/uvm/uvm-scoreboard#UVM_Scoreboad_types)
919	
920	- **In-Order Scoreboard:**
921	
922	  - Expects output transactions to arrive in the exact same sequence as input stimuli were applied.
923	
924	  - Implementation: Uses a standard FIFO queue (`exp_queue.push_back()` and `exp_queue.pop_front()`).
925	
926	  - Suitable for FIFOs, pipelined buffers without arbitration, and simple streaming interfaces.
927	
928	- **Out-of-Order Scoreboard:**
929	
930	  - Accommodates designs where transactions may complete out of arrival order (e.g., AXI bus with independent read/write IDs, PCIe split transactions, network routers).
931	
932	  - Implementation: Uses associative arrays or hash tables indexed by a transaction ID or tag (e.g., `exp_table[item.id] = item`). When an actual item arrives, it searches the table by key, compares contents, and deletes the matched entry.
933	
934	---
935	
936	## Difficult Level Questions
937	
938	### 1. Difference between `p_sequencer` and `m_sequencer`
939	
940	| Feature | `m_sequencer` | `p_sequencer` |
941	| --- | --- | --- |
942	| **Definition** | Generic default sequencer handle built into `uvm_sequence_base` | User-defined, strongly-typed sequencer handle created in custom sequence |
943	| **Data Type** | `uvm_sequencer_base` | Specific user sequencer type (e.g., `my_custom_sequencer`) |
944	| **Availability** | Available by default in all sequences without declaration | Requires declaration via `` `uvm_declare_p_sequencer(my_custom_sequencer) `` |
945	| **Member Access** | Can only access standard methods of `uvm_sequencer_base` | Can directly access custom sequencer variables, handles, clocks, and sub-sequencers |
946	| **Virtual Sequences** | Inadequate for virtual sequences because it cannot see sub-sequencer handles | Essential in virtual sequences to coordinate child sequencers directly |
947	
948	---
949	
950	### 2. What is a virtual sequence? How is it used? Is it necessary to have a virtual sequencer for a virtual sequence?
951	
952	*Refer: *[*virtual-sequence-and-virtual-sequencer*](https://vlsiverify.com/uvm/virtual-sequence-and-virtual-sequencer)
953	
954	- **What is a Virtual Sequence?**
955	  A sequence that coordinates and orchestrates stimulus generation across **multiple interfaces/agents** simultaneously (e.g., configuring registers over APB while driving Ethernet packets into an ingress port).
956	
957	- **How is it used?**
958	  It does **not** send sequence items directly to a driver. Instead, its `body()` task starts child sequences on different physical sequencers.
959	
960	- **Is a virtual sequencer necessary?**
961	  **No, it is not strictly necessary.**
962	
963	  - If a virtual sequencer is used, the virtual sequence accesses child sequencer handles via its `p_sequencer`.
964	
965	  - Alternatively, the sub-sequencer handles can be passed directly to the virtual sequence from the test or configuration object before calling `seq.start(null)`, completely eliminating the need for a virtual sequencer component.
966	
967	---
968	
969	### 3. Explain the virtual sequencer and its use
970	
971	*Refer: *[*virtual-sequence-and-virtual-sequencer*](https://vlsiverify.com/uvm/virtual-sequence-and-virtual-sequencer)
972	
973	- **What it is:** A `uvm_sequencer` subclass that contains handles pointing to real agent sequencers within the testbench environment.
974	
975	- **Distinguishing characteristic:** It is **not** connected to any driver (`seq_item_port`).
976	
977	- **Use:** Serves as a centralized lookup container. Virtual sequences can target this virtual sequencer using `` `uvm_declare_p_sequencer(v_sequencer_t) `` to obtain clean, typed access to all underlying sub-sequencers.
978	
979	---
980	
981	### 4. What is the UVM barrier and its usage?
982	
983	*Refer: *[*uvm-barrier*](https://vlsiverify.com/uvm/uvm-barrier)
984	
985	`uvm_barrier` is a synchronization class used to align multiple concurrent processes or threads across different components:
986	
987	- Configured with a threshold count: `barrier.set_threshold(N);`
988	
989	- When a process reaches a synchronization checkpoint, it calls `barrier.wait_for();` and blocks.
990	
991	- Once $N$ processes have called `wait_for()`, the barrier trips, and all $N$ waiting processes are unblocked simultaneously.
992	
993	---
994	
995	### 5. What is the UVM heartbeat and its usage?
996	
997	*Refer: *[*uvm-heartbeat*](https://vlsiverify.com/uvm/uvm-heartbeat)
998	
999	`uvm_heartbeat` is a liveness monitoring mechanism designed to prevent and diagnose simulation deadlocks or hangs:
1000	
1001	- Monitored components trigger heartbeat signals (e.g., raising an event on each completed transaction or periodic activity).
1002	
1003	- The heartbeat monitor checks that active components emit signals within a predefined window.
1004	
1005	- If a component fails to emit a heartbeat within the allowable interval, the heartbeat monitor flags a timeout and terminates simulation with a detailed debug report.
1006	
1007	---
1008	
1009	### 6. What is a Singleton object and its usage?
1010	
1011	*Refer: *[*singleton-object*](https://vlsiverify.com/uvm/singleton-object)
1012	
1013	A **Singleton** is an object-oriented design pattern ensuring that only **one instance** of a specific class exists throughout the entire simulation, accessible via a global static method (e.g., `get()`).
1014	
1015	**Usage in UVM:**
1016	
1017	- `uvm_root` (`uvm_top`): The root component managing the entire testbench hierarchy and phase execution.
1018	
1019	- `uvm_factory`: The global registry holding all type and instance overrides.
1020	
1021	- Configuration and Resource databases (`uvm_config_db`, `uvm_resource_db`).
1022	
1023	---
1024	
1025	### 7. Given an IP, you are the owner of the IP, what are the steps you start with and when will it be signed off?
1026	
1027	*Refer: *[*asic-verification-flow*](https://vlsiverify.com/asic-flows/asic-verification-flow)
1028	
1029	#### Step-by-Step ASIC/IP Verification Flow:
1030	
1031	1. **Specification Review:** Study architectural specs, register maps, interface timing diagrams, and protocol requirements.
1032	
1033	2. **Verification Plan (vPlan) Creation:** Define features, test scenarios, coverage metrics, error cases, and corner conditions.
1034	
1035	3. **Testbench Architecture & Environment Setup:**
1036	
1037	   - Develop interfaces, UVC agents (driver, monitor, sequencer).
1038	
1039	   - Implement scoreboards, reference models, and register models (RAL).
1040	
1041	4. **Sanity & Bring-Up:** Develop reset sequence, register read/write tests, and basic smoke tests to ensure DUT is alive.
1042	
1043	5. **Feature Verification:** Implement directed and constrained-random sequences targeting every feature in the vPlan.
1044	
1045	6. **Error Injection & Stress Testing:** Test corner cases, backpressure, FIFO full/empty, invalid protocol handshakes, and illegal configurations.
1046	
1047	7. **Coverage Analysis & Closure:**
1048	
1049	   - **Functional Coverage:** Measure covergroups and coverpoints against the vPlan.
1050	
1051	   - **Code Coverage:** Review line, branch, condition, toggle, and FSM coverage.
1052	
1053	   - **Assertion Coverage:** Verify SVA protocol assertions.
1054	
1055	8. **Regression Automation:** Run nightly randomized test suites across multiple seeds.
1056	
1057	#### Sign-off Criteria:
1058	
1059	- **100% Functional Coverage** achieved against the approved verification plan.
1060	
1061	- **Target Code Coverage** reached (typically $>95-98\%$ with all unreached lines formally reviewed/waived).
1062	
1063	- **100% Assertion Coverage** with zero assertion failures.
1064	
1065	- **Zero Open Severity-1 / Severity-2 Bugs**.
1066	
1067	- **Clean Regressions:** Multiple clean regression runs across random seeds without failures.
