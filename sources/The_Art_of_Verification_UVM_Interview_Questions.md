card "The Art of Verification UVM Interview Questions" [dcf3d344-a4b5-43c6-98d0-bedd27cdad99] 901 lines
--- Databases ---
- tag "clipper" [952b4c12-6872-4764-82fe-545db6267cb4]
  - "URL": " https://theartofverification.com/uvm-interview-questions/"
1	# The Art of Verification UVM Interview Questions
2	
3	**In short:** These UVM interview questions cover the topics interviewers ask most: TLM ports and analysis ports, sequences and sequence items, the driver-sequencer handshake API, the factory and overrides, uvm\_config\_db, phasing, objections, RAL, and callbacks. Each answer includes real UVM code you can adapt. Work through them out loud and you will be ready to explain not just what each feature does but why it exists. Pair this with the wider [interview questions](https://theartofverification.com/category/interview-questions/) for full coverage.
4	
5	Universal Verification Methodology (UVM) is the industry standard for building reusable, class-based testbenches on top of [SystemVerilog](https://theartofverification.com/category/system-verilog/). An interviewer wants to see that you understand how the pieces connect: how a sequence talks to a driver, how the factory lets you swap components without editing code, and how objections end a phase cleanly. The answers below are grouped so you can revise one area at a time. For deeper reading on any topic, follow the [UVM](https://theartofverification.com/category/uvm/) links.
6	
7	## A simple way to picture a UVM testbench
8	
9	Think of a UVM testbench like a restaurant kitchen. The sequence is the order ticket that says what to cook. The sequencer is the pass where tickets queue and get handed out one at a time. The driver is the chef who takes a ticket and actually cooks it on the DUT stove, then signals done before taking the next ticket. The monitor is a quiet observer watching what leaves the kitchen, and the scoreboard is the head chef checking each dish against the recipe. The factory is the staffing agency: on any given night it can send a different chef (a derived class) to the same station without rewriting the menu. Once you see the roles this way, the driver-sequencer handshake and the factory overrides stop feeling abstract.
10	
11	If you’re looking to enter the world of ASIC or FPGA verification, then chances are you’ve heard of Universal Verification Methodology (UVM). UVM has become the industry standard for verifying digital designs, and as such, it is a crucial skill set for anyone looking to break into the field.
12	
13	Whether you’re a recent graduate or a seasoned professional, preparing for a UVM interview can be a daunting task. To help you prepare, we’ve put together a list of common UVM interview questions that you’re likely to encounter during the interview process.
14	
15	In this blog post, we’ll go over some of the most frequently asked UVM interview questions and provide tips on how to answer them effectively. We’ll cover topics such as UVM basics, transaction-level modeling (TLM), sequences, and more.
16	
17	So, if you’re ready to take your UVM knowledge to the next level and ace that interview, read on!
18	
19	### **1.** **Explain TLM ports and exports in UVM with examples.**
20	
21	In the Universal Verification Methodology (UVM), **TLM (Transaction Level Modeling) ports and exports are used for communication between different components of the testbench, such as the testbench itself and the DUT (Design Under Test).**
22	
23	**TLM ports** are interfaces that allow the testbench components to initiate transactions to the DUT, while **TLM exports** are interfaces that allow the DUT to initiate transactions to the testbench.
24	
25	Here is an example to illustrate the use of **TLM ports and exports** in UVM:
26	
27	Assume that we have a testbench component called “driver” that generates stimulus for the DUT and a testbench component called “monitor” that monitors the DUT’s behavior. We want to use TLM ports and exports to allow communication between the driver and the DUT, and between the DUT and the monitor.
28	
29	First, we define a **TLM port** in the driver component:
30	
31	```
32	class driver extends uvm_driver #(transaction);
33	  // Define a TLM port for the driver
34	  `uvm_analysis_port #(transaction) analysis_port;
35	  ...
36	endclass
37	
38	```
39	
40	This **TLM port** is used to send transactions from the driver to the DUT.
41	
42	Next, we define a **TLM export** in the DUT:
43	
44	```
45	class dut extends uvm_component;
46	  // Define a TLM export for the DUT
47	  `uvm_analysis_export #(transaction) analysis_export;
48	  ...
49	endclass
50	
51	```
52	
53	This **TLM export** is used to send transactions from the DUT to the monitor.
54	
55	Finally, we **connect** the **TLM port and export** in the testbench’s build phase:
56	
57	```
58	class my_testbench extends uvm_test;
59	  // Instantiate the driver, DUT, and monitor components
60	  driver my_driver;
61	  dut my_dut;
62	  monitor my_monitor;
63	  ...
64	
65	  function void build_phase(uvm_phase phase);
66	    super.build_phase(phase);
67	    // Connect the driver's analysis port to the DUT's analysis export
68	    my_driver.analysis_port.connect(my_dut.analysis_export);
69	    // Connect the DUT's analysis port to the monitor's analysis export
70	    my_dut.analysis_port.connect(my_monitor.analysis_export);
71	    ...
72	  endfunction
73	endclass
74	
75	```
76	
77	This code **connects the driver’s TLM port to the DUT’s TLM export**, and the **DUT’s TLM port to the monitor’s TLM export.** Now the driver can send transactions to the DUT, which can then send transactions to the monitor for analysis.
78	
79	Overall,** TLM ports and exports** provide a powerful mechanism for communication between different components of a testbench in UVM, allowing for modular and flexible testbench design.
80	
81	For more details regarding **UVM TLM Concepts** please refer below mentioned blog post:
82	
83	### **2**. **How analysis ports/FIFOs and TLM ports/FIFOs differs? Explain** **the usecase of analysis ports/FIFOs being used in the testbench?**
84	
85	In UVM, **analysis ports and TLM (Transaction Level Modeling) ports** are both used for communication between UVM components, but they serve slightly different purposes.
86	
87	**Analysis ports are used for one-to-many communication**, where a single UVM component sends data to multiple other components. An analysis port is typically implemented as a SystemVerilog interface with an associated `write` method. Components that want to receive the data connect to the analysis port using a **`` `uvm_analysis_port ``** object, which provides a **`write`**** method** that forwards the data to the **analysis port**. The analysis port then distributes the data to all connected components. Analysis ports are typically used for broadcasting events or passing data to multiple subscribers, such as for logging or coverage collection.
88	
89	**TLM ports, on the other hand, are used for point-to-point communication** between UVM components. TLM ports are also implemented as SystemVerilog interfaces, but they typically provide a set of transaction-level methods (such as `write`, `read`, `peek`, etc.) that allow components to exchange transaction-level data directly. Components connect to TLM ports using a **`uvm_tlm_port`**`  or  `**`` `uvm_tlm_fifo ``** object. TLM ports are typically used for more fine-grained communication between components, such as passing transactions between a driver and a monitor.
90	
91	Similarly, **analysis FIFOs and TLM FIFOs are used for one-to-many and point-to-point communication, respectively**. Analysis FIFOs are implemented as SystemVerilog interfaces with an associated `write` method that allows components to push data into the FIFO. Components that want to receive the data connect to the analysis FIFO using a **\`****`uvm_analysis_fifo`** object, which provides a `get` method that retrieves the data from the FIFO. TLM FIFOs, on the other hand, are implemented as SystemVerilog classes that provide a set of transaction-level methods (such as `write`, `read`, `peek`, etc.) that allow components to exchange transaction-level data directly. Components connect to TLM FIFOs using a **\`****`uvm_tlm_fifo`** object.
92	
93	The use case of analysis ports/FIFOs and TLM ports/FIFOs in UVM depends on the specific needs of the design being tested. In general, analysis ports/FIFOs are useful for broadcasting events or passing data to multiple subscribers, while TLM ports/FIFOs are useful for fine-grained communication between specific pairs of components. **For example, analysis ports/FIFOs might be used to log data or collect coverage information from multiple components in a testbench, while TLM ports/FIFOs might be used to pass transaction-level data between a driver and a monitor.**
94	
95	### **3.** **Sequence Vs Sequence item in UVM? Explain with Example**
96	
97	In the Universal Verification Methodology (UVM), a sequence is a class that defines a series of operations or stimuli to be applied to a DUT (Design Under Test) to test its functionality. Each operation or stimulus in a sequence is referred to as a sequence item.
98	
99	To illustrate the difference between a sequence and sequence item in UVM, consider the following example:
100	
101	```verilog
102	class ReadWriteSequence extends uvm_sequence#(ReadWriteSequenceItem);
103	  `uvm_object_utils(ReadWriteSequence)
104	
105	  virtual task body();
106	    ReadWriteSequenceItem item;
107	
108	    // Read sequence
109	    item = ReadWriteSequenceItem::type_id::create("read_item");
110	    item.operation = READ;
111	    start_item(item);
112	    finish_item(item);
113	
114	    // Write sequence
115	    item = ReadWriteSequenceItem::type_id::create("write_item");
116	    item.operation = WRITE;
117	    item.data = 0xABCD;
118	    start_item(item);
119	    finish_item(item);
120	  endtask
121	endclass
122	
123	class ReadWriteSequenceItem extends uvm_sequence_item;
124	  `uvm_object_utils(ReadWriteSequenceItem)
125	
126	  typedef enum {READ, WRITE} operation_e;
127	  operation_e operation;
128	  rand int data;
129	
130	  // ...
131	endclass
132	```
133	
134	In this example, `ReadWriteSequence` is a **UVM sequence that defines a sequence of operations** to be applied to a DUT. It includes **two sequence items: a read item and a write item.** Each item is of type `ReadWriteSequenceItem`, which is a subclass of `uvm_sequence_item`. The `ReadWriteSequenceItem` class defines the attributes for each item, including the type of operation (read or write) and the data to be written in the case of a write operation.
135	
136	So, to summarize, **a sequence is a collection of sequence items that defines a series of operations to be applied to a DUT, while a sequence item is an individual operation or stimulus within a sequence, with its own set of attributes and behaviors.**
137	
138	### **4.** **Explain how uvm\_transaction differs from a uvm\_sequence\_item in UVM with example**
139	
140	In the Universal Verification Methodology (UVM), a transaction is a collection of data items that represent a single unit of information being transferred between two components. On the other hand, a sequence item is an object that represents a single transaction that needs to be sent or received.
141	
142	The main difference between a **`uvm_transaction`** and a **`uvm_sequence_item`** is their level of abstraction. A `uvm_sequence_item` is a more abstract representation of a transaction, while a `uvm_transaction` is a more concrete representation.
143	
144	A **`uvm_sequence_item`** is typically used to specify the behavior of a particular transaction that needs to be generated or monitored. It contains the necessary data fields and methods to generate or check a transaction, but it does not contain any implementation details. The implementation details are provided by the `uvm_driver` or `uvm_monitor` that handle the **`uvm_sequence_item`****.**
145	
146	Here is an example of a `uvm_sequence_item` that represents a read transaction:
147	
148	```verilog
149	class read_sequence_item extends uvm_sequence_item;
150	  rand bit [31:0] addr;
151	  rand bit [7:0] data;
152	
153	  `uvm_object_utils(read_sequence_item)
154	
155	  function new(string name = "read_sequence_item");
156	    super.new(name);
157	  endfunction
158	
159	  task pre_randomize();
160	    // Set defaults for the data fields
161	    addr = 0;
162	    data = 0;
163	  endtask
164	endclass
165	```
166	
167	In this example, the `read_sequence_item` contains two data fields, `addr` and `data`, that represent the address and data of the read transaction. It also has a `pre_randomize` task that sets default values for the data fields before they are randomized.
168	
169	On the other hand, a **`uvm_transaction`** is a more concrete representation of a transaction. It is used to represent the actual transaction that is being generated or monitored by the `uvm_driver` or `uvm_monitor`. It contains the same data fields as the `uvm_sequence_item`, but it also includes implementation details such as timing information and status information.
170	
171	Here is an example of a `uvm_transaction` that represents the read transaction:
172	
173	```verilog
174	class read_transaction extends uvm_transaction;
175	  bit [31:0] addr;
176	  bit [7:0] data;
177	  bit [31:0] timestamp;
178	  bit error;
179	
180	  `uvm_object_utils(read_transaction)
181	
182	  function new(string name = "read_transaction");
183	    super.new(name);
184	  endfunction
185	endclass
186	```
187	
188	In this example, the `read_transaction` contains the same data fields as the `read_sequence_item`, but it also includes a `timestamp` field that represents the time when the transaction was generated or received, and an `error` field that represents whether an error occurred during the transaction.
189	
190	**In summary, a ****`uvm_sequence_item`**** is a more abstract representation of a transaction that is used to specify the behavior of a transaction, while a ****`uvm_transaction`**** is a more concrete representation of a transaction that includes implementation details such as timing and status information. It is recommended to use uvm\_sequence\_item for implementing sequence-based stimulus.**
191	
192	### **5.** **copy() Vs clone() Vs create() method in a** **UVM** **components?**
193	
194	In UVM (Universal Verification Methodology), copy(), clone(), and create() are methods used for creating new objects. The main difference between these methods is:
195	
196	- \1) The **create()** method constructs a new object through the UVM factory. For example, for a sequence item:
197	
198	  ```systemverilog
199	  my_item item;
200	  item = my_item::type_id::create("item");
201	  ```
202	
203	  The class must be registered with the factory (for example, with `uvm_object_utils(my_item)`). For a component, pass its parent too: `my_driver::type_id::create("driver", this)`.
204	
205	- \2) The **copy()** method copies the contents of one object into another already-created object. In UVM, the destination object's `copy()` method takes the source as its argument:
206	
207	  ```systemverilog
208	  my_item src, dst;
209	  src = my_item::type_id::create("src");
210	  dst = my_item::type_id::create("dst");
211	  src.data = 8'hA5;
212	  dst.copy(src); // Copy src's data into dst
213	  ```
214	
215	  The class should implement `do_copy()` to copy its own fields (and call `super.do_copy()` when appropriate).
216	
217	- \3) The **clone()** method creates a new object and copies the current object's contents into it. It returns a `uvm_object` handle, so cast it to the specific type:
218	
219	  ```systemverilog
220	  my_item src, cloned;
221	  src = my_item::type_id::create("src");
222	  src.data = 8'hA5;
223	  if (!$cast(cloned, src.clone()))
224	    `uvm_fatal("CLONE_FAIL", "Could not cast cloned object")
225	  // cloned is a separate object with copied field values
226	  ```
227	
228	  `clone()` relies on the factory `create()` mechanism and the class's copy implementation. These examples assume `my_item` registers with the factory and implements field copying (often using UVM field macros or `do_copy()`).
229	
230	### **6.** **How get\_name() differs from get\_full\_name()** **method in a UVM?**
231	
232	In UVM (Universal Verification Methodology), **get\_name()** and **get\_full\_name()** are methods used to retrieve the name of an object. The main difference between these methods is:
233	
234	1. **get****\_name():** The get\_name() method retrieves the name of an object, but only the name of the object itself, without any hierarchy information. This method returns a string that represents the name of the object.
235	
236	2. **get\_full\_name():** The get\_full\_name() method retrieves the full hierarchical name of an object, including the names of all the parent objects, separated by dots. This method returns a string that represents the full hierarchical name of the object.
237	
238	In other words, **get\_name()** returns the name of the object itself, while **get\_full\_name()** returns the full hierarchical name of the object, including the names of all the parent objects in the hierarchy.
239	
240	For example, suppose a component named `my_driver` is created under an environment named `env`, which is under the test `uvm_test_top`.
241	
242	```systemverilog
243	class my_driver extends uvm_driver #(my_item);
244	  `uvm_component_utils(my_driver)
245	
246	  function new(string name, uvm_component parent);
247	    super.new(name, parent);
248	  endfunction
249	endclass
250	
251	// In the environment's build_phase:
252	driver = my_driver::type_id::create("my_driver", this);
253	
254	// For that driver instance:
255	// get_name()      returns "my_driver"
256	// get_full_name() returns "uvm_test_top.env.my_driver"
257	$display("name=%s full=%s", driver.get_name(), driver.get_full_name());
258	```
259	
260	`get_name()` returns only this component's local name; `get_full_name()` includes its UVM component hierarchy. These methods are most useful on `uvm_component` objects; ordinary `uvm_object` objects do not have a component hierarchy.
261	
262	### **7.** **Explain the difference between UVM ACTIVE agent and UVM PASSIVE agent?**
263	
264	In the context of the Universal Verification Methodology (UVM), an **ACTIVE** agent is an agent that initiates transactions on its own, whereas a **PASSIVE** agent waits for the other side to initiate transactions.
265	
266	An **ACTIVE** agent is responsible for generating transactions and driving them onto the bus or interface. It contains the logic to create the stimulus and control the timing of the transactions. ACTIVE agents are commonly used for stimulus generation, protocol checking, and coverage collection.
267	
268	On the other hand, a **PASSIVE** agent is responsible for receiving transactions and responding to them. It waits for the other side to initiate transactions and reacts to them accordingly. <hepta-color type="text" color="blue">PASSIVE agents are commonly used for monitoring the protocol, collecting protocol statistics, and checking for errors or violations.</hepta-color>
269	
270	An Agent is normally configured ACTIVE in a block level verification environment where stimulus is required to be generated. Same agent can be configured PASSIVE as we move from block level to chip level verification environment in which no stimulus generation is needed, but we still can use same for monitoring activity in terms of debug or coverage.
271	
272	To summarize, the key difference between ACTIVE and PASSIVE agents in UVM is that ACTIVE agents initiate transactions, while PASSIVE agents wait for transactions to be initiated by the other side.
273	
274	### **8.** **How is an Agent configured as ACTIVE or PASSIVE?**
275	
276	UVM agents have a variable of type UVM\_ACTIVE\_PASSIVE\_e which defines whether the agent is active (UVM\_ACTIVE) with the sequencer and the driver constructed, or passive (UVM\_PASSIVE) with neither the driver nor the sequencer constructed. This parameter is called active and by default, it is set to UVM\_ACTIVE. This can be changed using set\_config\_int() while the agent is created in the environment class. The build phase of the agent should then have the code as below to selectively construct driver and sequencer.
277	
278	```verilog
279	function void build_phase(uvm_phase phase);
280	if(m_cfg.active == UVM_ACTIVE) begin
281	//create driver, sequencer
282	end
283	endfunction
284	```
285	
286	### **9.** **In UVM how a monitor differs from a scoreboard in UVM?**
287	
288	In the Universal Verification Methodology (UVM), monitors and scoreboards are two distinct components used for verifying the design under test (DUT).
289	
290	A **monitor** is responsible for observing signals or transactions on the DUT’s interface and converting them into a higher-level abstraction that can be easily understood by the testbench. The monitor typically operates at the physical layer and captures the data being sent or received by the DUT. It can also perform additional tasks such as protocol checking, error detection, and data extraction.
291	
292	On the other hand, a **scoreboard** is responsible for comparing the actual results generated by the DUT with the expected results provided by the testbench. It takes in the data produced by the monitor and performs comparisons against the expected data. The scoreboard typically operates at the transactional or functional layer and can identify errors such as incorrect data, missing transactions, or out-of-order transactions.
293	
294	In summary, while both monitors and scoreboards are used for verification in UVM, they have distinct roles and operate at different layers of abstraction. The monitor captures the data being sent or received by the DUT, while the scoreboard performs comparisons against the expected results provided by the testbench.
295	
296	### **10.** **What steps are needed to run a sequence?**
297	
298	There are three steps needed to run a sequence as follows:
299	
300	\1) Creating a sequence. A sequence is created using the factory create method as shown below:
301	
302	```systemverilog
303	my_sequence_c seq;
304	seq = my_sequence_c::type_id::create("my_seq");
305	```
306	
307	\2) Configuring or randomizing a sequence. A sequence might have several data members that might need configuration or randomization. Accordingly, either configure values or call **seq.randomize()**. For example:
308	
309	```systemverilog
310	if (!seq.randomize())
311	  `uvm_error("RANDFAIL", "Sequence randomization failed")
312	```
313	
314	\3) Starting a sequence. A sequence is started using the **sequence.start()** method. Pass the sequencer handle on which it should run. For example, from a test or another component:
315	
316	```systemverilog
317	seq.start(env.agent.sequencer);
318	```
319	
320	The call to `start()` runs the sequence's `body()` task and blocks until the sequence completes. Together, the steps look like this:
321	
322	```systemverilog
323	my_sequence_c seq;
324	seq = my_sequence_c::type_id::create("my_seq");
325	if (!seq.randomize())
326	  `uvm_fatal("RANDFAIL", "Sequence randomization failed")
327	seq.start(env.agent.sequencer);
328	```
329	
330	### **11.** **What are pre\_body() and post\_body() functions in a sequence? Do they** **always get called?**
331	
332	pre\_body() is a method in a sequence class that gets called before the body() method of a sequence is called. post\_body() method in sequence gets called after the body() method is called.
333	
334	The pre\_body() and post\_body() methods are not always called. The uvm\_sequence::start() has an optional argument which if set to 0, will result in these methods not being called. Following are the formal argument of start() method in a sequence.
335	
336	```
337	virtual task start (
338	uvm_sequencer_base sequencer, // Pointer to sequencer
339	uvm_sequence_base parent_sequencer = null, // parent sequencer
340	integer this_priority = 100, // Priority on the sequencer
341	bit call_pre_post = 1); // pre_body and post_body called
342	```
343	
344	### **12.** **Is the start() method on a sequence blocking or nonblocking?**
345	
346	The start() method is a blocking call. It blocks execution until the body() method of the sequence completes execution.
347	
348	### **13.** **How can a sequence get exclusive access to a sequencer?**
349	
350	When multiple sequences are run on a sequencer, the sequencer arbitrates and grants access to each sequence on a sequence item boundary. Sometimes a sequence might want exclusive access to sequencer until all the sequence items part of it are driven to the driver
351	
352	(for example: if you want to stimulate a deterministic pattern without any interruption).
353	
354	There are two mechanisms that allow a sequence to get exclusive access to sequencer.
355	
356	\1) **Using lock() and unlock( )**: A sequence can call the lock method of the sequencer on which it runs. The calling sequence will be granted exclusive access to the driver when it gets the next slot via the sequencer arbitration mechanism. If there are other sequences marked as a higher priority, this sequence needs to wait until it gets its slot. Once the lock is granted, no other sequences will be able to access the driver until the sequence issues an unlock() call on the sequencer which will then release the lock. The lock method is blocking and does not return until the lock has been granted.
357	
358	\2) **Using grab() and ungrab(): **The grab method is similar to the lock method and can be called by the sequence when it needs exclusive access. The difference between grab and lock is that when grab() is called, it takes immediate effect and the sequence will grab the next sequencer arbitration slot, overriding any sequence priorities in place. The only thing that can stop a sequence from grabbing a sequencer is an already existing lock() or grab() condition on the sequencer.
359	
360	### **14.** **What is the difference between a pipelined and a non-pipelined** **sequence-driver model?**
361	
362	Based on how a design interface needs to be stimulated, there can be two modes implemented in an UVM driver class.
363	
364	\1) Non-pipelined model: If the driver models only one active transaction at a time, then it is called a non-pipelined model. In this case, the sequence can send one transaction to the driver and the driver might take several cycles (based on the interface protocol) to finish driving that transaction. Only after that, the driver will accept a new transaction from the sequencer
365	
366	```verilog
367	class nonpipe_driver extends uvm_driver #(req_c);
368	  task run_phase(uvm_phase phase);
369	  req_c req;
370	  forever begin
371	    get_next_item(req); // Item from sequence via sequencer
372	    // drive request to DUT which can take more clocks
373	    // Sequence is blocked to send new items til then
374	    item_done(); // ** Unblocks finish_item() in sequence
375	  end
376	  endtask: run_phase
377	endclass: nonpipe_driver
378	
379	```
380	
381	\2) **Pipelined model**: If the driver models more than one active transaction at a time, then it is called a pipelined model. In this case sequence can keep sending new transactions to driver without waiting for driver to complete a previous transaction. In this case, on every transaction send from the sequence, driver will fork a separate process to drive the interface signals based on that transaction, but will not wait until it is completed before accepting a new transaction. This modelling is useful if we want to drive back to back requests on an interface without waiting for responses from design.
382	
383	```verilog
384	class pipeline_driver extends uvm_driver #(req_c);
385	  task run_phase(uvm_phase phase);
386	  req_c req;
387	  forever begin
388	    get_next_item(req); // Item from sequence via sequencer
389	    fork
390	      begin
391	        //drive request to DUT which can take more clocks
392	        //separate thread that doesn’t block sequence
393	        //driver can accept more items without waiting
394	      end
395	    join_none
396	    item_done(); // ** Unblocks finish_item() in sequence
397	  end
398	  endtask: run_phase
399	endclass: pipeline_driver
400	
401	```
402	
403	### **15. How do we make sure that if multiple sequences are running on a sequencer-driver, responses are send back from the driver to the correct** **sequence?**
404	
405	If responses are returned from the driver for one of several sequences, the sequence id field in the sequence is used by the sequencer to route the response back to the right sequence. <hepta-color type="text" color="blue">The response handling code in the driver should use the </hepta-color><hepta-color type="text" color="blue">***set\_id\_info() ***</hepta-color><hepta-color type="text" color="blue">call to ensure that any response items have the same sequence id as their originating request.</hepta-color>
406	
407	Here is an example code in driver that gets a sequence item and sends a response back
408	
409	(*Note that this is a reference pseudo code for illustration and some functions are assumed to be coded somewhere else*)
410	
411	```verilog
412	class my_driver extends uvm_driver;
413	  //function that gets item from sequence port and
414	  //drives response back
415	  function drive_and_send_response();
416	    forever begin
417	      seq_item_port.get(req_item);
418	      //function that takes req_item and drives pins
419	      drive_req(req_item);
420	      //create a new response item
421	      rsp_item = new();
422	      //some function that monitors response signals from dut
423	      rsp_item.data = m_vif.get_data();
424	      //copy id from req back to response
425	      rsp.set_id_info(req_item);
426	      //write response on rsp port
427	      rsp_port.write(rsp_item);
428	    end
429	  endfunction
430	endclass
431	
432	```
433	
434	### **16.** **What is the difference between early randomization and late** **randomization while generating a sequence?**
435	
436	In **Early randomization**, a sequence object is first randomized using randomize() call and then the sequence calls start\_item() to request access to a sequencer, which is a blocking call and can take time-based upon how busy the sequencer is. The following example shows an object (req) randomized first and then sequence waits for arbitration
437	
438	```verilog
439	task body()
440	  assert(req.randomize());
441	  start_item(req); //Can consume time based on sequencer arbitration
442	  finish_item(req);
443	endtask
444	
445	```
446	
447	In **Late randomization,** a sequence first calls start\_item() , waits until arbitration is granted from the sequencer, and then just before sending the transaction to sequencer/driver, randomize is called. This has the advantage that items are randomized just in time and can use any feedback from design or other components just before sending an item to driver. Following code shows late randomization of a request (req)
448	
449	```verilog
450	task body()
451	  start_item(req); //Can consume time based on sequencer arbitration
452	  assert(req.randomivze());
453	  finish_item(req);
454	endtask
455	
456	```
457	
458	### **17.** **What is the difference between get\_next\_item() and try\_next\_item()** **methods in UVM driver class?**
459	
460	The `get_next_item()` is a **blocking call** (part of the driver-sequencer API) which blocks until a sequence item is available for the driver to process, and returns a pointer to the sequence item.
461	
462	The `try_next_item()` is a **nonblocking** version which returns a null pointer if no sequence item is available for driver to process.
463	
464	### **18.** **What is the difference between get\_next\_item() and get() methods in** **UVM driver class?**
465	
466	The `get_next_item()` is a **blocking call** to get the sequence item from the sequencer FIFO for processing by driver. Once the sequence item is processed by a driver, it needs to call `item_done()` to complete the handshake before a new item is requested using get\_next\_item().
467	
468	The `get()` is also a **blocking call** which gets the sequence item from sequencer FIFO for processing by driver. However, while using `get()`, there is no need to explicitly call `item_done()` as the `get()` method completes the handshake implicitly.
469	
470	### **19.** **What is the difference between get() and peek() methods of UVM driver** **class?**
471	
472	The `get()` method part of driver class is a **blocking call** which gets the sequence item from sequencer FIFO for processing by driver. It unblocks once an item is available and completes handshake with sequencer.
473	
474	The `peek()` method is similar to `get()` and **blocks** until a sequence item is available. However, <hepta-color type="text" color="blue">it will not remove the request from the sequencer FIFO</hepta-color>. So calling `peek()` multiple times will return same sequencer item in driver.
475	
476	### **20.** **What is the difference in item\_done() method of driver-sequencer API** **when called with and without arguments?**
477	
478	The `item_done()` method is a non blocking method in driver class that is used to complete handshake with the sequencer after a `get_next_item()` or `try_next_item()` is successful.
479	
480	If there is no need to send a response back, `item_done()` is called with no argument which will complete the handshake without placing anything in the <hepta-color type="text" color="blue">sequencer response FIFO</hepta-color>. If there is a need to send a response back, `item_done()` is passed with a pointer to a response `sequence_item` as an argument. This response pointer will be placed in the sequencer response FIFO which can be processed by the sequence as a response to the request it drove.
481	
482	### **21.** **Which of the following driver class methods are blocking calls and** **which are nonblocking?**
483	
484	\1) get()
485	
486	\2) get\_next\_item()
487	
488	\3) item\_done()
489	
490	\4) put()
491	
492	\5) try\_next\_item()
493	
494	\6) peek()
495	
496	get(), get\_next\_item(), peek() are blocking calls.
497	
498	try\_next\_item(), item\_done(), and put() are nonblocking calls
499	
500	### **22.** **How can you stop all sequences running on a sequencer?**
501	
502	The sequencer has a method **`stop_sequences()`**** **that can be used to stop all sequences. However, this method does not check if the driver is currently processing any `sequence_items`. Because of this, if the driver calls an `item_done()` or `put()`, there can be a Fatal Error as the sequence pointer might not be valid. So a user needs to take care of making sure that once `stop_sequence()` is called, the sequencer thread is disabled (if started in a fork).
503	
504	### **23.** **Which method in the sequence gets called when user calls** **sequence.print() method?**
505	
506	**convert2string() : **It is recommended to implement this function which returns a string representation of the object (values of its data members). **This is useful to get debug information printed to simulator transcript or log file**.
507	
508	### **24.** **How do we register an uvm\_component class and uvm\_sequence class** **with factory?**
509	
510	The uvm\_sequence class is registered with the factory using uvm\_object\_utils() macro and passing the class name as an argument. An example below:
511	
512	```verilog
513	class test_seq_c extends uvm_sequence;
514	`uvm_object_utils(test_seq_c)
515	```
516	
517	The uvm\_component class is registered with the factory using uvm\_component\_utils() macro and passing the class name as argument. An Example below:
518	
519	```verilog
520	class test_driver_c extends uvm_component;
521	`uvm_component_utils(test_driver_c)
522	```
523	
524	### **25.** **Why should we register a class with factory?**
525	
526	<hepta-color type="text" color="green">A factory is a special look-up table used in UVM for creating objects of component or transaction types.</hepta-color> The benefit of object creation using the factory is that a testbench build process can decide at run-time which type of object has to be created. Based on this, a class type could be substituted with another derived class type without any real code change. <hepta-color type="text" color="blue">To ensure this feature and capability, all classes are recommended to be registered with the factory.</hepta-color> If you do not register a class with the factory, then you will not be able to use the factory `method::type_id::create()` to construct an object.
527	
528	> [Concept of UVM Factory](https://theartofverification.com/concept-of-uvm-factory/)
529	
530	### **26.** **What is meant by factory override?**
531	
532	The UVM factory allows a class to be substituted with another derived class at the point of construction. This can be useful for changing the behavior of a testbench by substituting one class for another <hepta-color type="text" color="blue">**without having the need to edit**</hepta-color> or <hepta-color type="text" color="blue">**re-compile the testbench code**</hepta-color>.
533	
534	### **27.** **What is the difference between instance override and type override?**
535	
536	A **type override **means that every time a component class type is created in a testbench hierarchy, a substitute type is created in its place. This applies to all instances of that component type. On the other hand, an **instance override **means, overriding only a specific instance of a component class. A specific instance of a component is referenced by the position of that component in the UVM component hierarchy. Since only UVM component classes can have a hierarchy in UVM test benches, <hepta-color type="text" color="blue">only component classes can be overridden on an instance </hepta-color>granularity while <hepta-color type="text" color="blue">sequences (or UVM objects) can be the only type overridden.</hepta-color>
537	
538	### **28.** **Can instance override and type override be used for both uvm\_component class and transaction types ?**
539	
540	No, only UVM\_component classes are part of UVM testbench hierarchy and can be overridden on an instance granularity. The sequence items or sequences are not a part of UVM testbench hierarchy and <hepta-color type="text" color="blue">hence can only be overridden using </hepta-color><hepta-color type="text" color="blue">**type override**</hepta-color><hepta-color type="text" color="blue"> which will override all objects of that type.</hepta-color>
541	
542	### **29.** **What is the concept of objections and where are they useful?**
543	
544	The `uvm_objection` class provides a means for sharing a counter between multiple components and sequences. Each component/sequence may “raise” and “drop” objections asynchronously, which increases or decreases the counter value. When the counter reaches zero (from a non-zero value), an “all dropped” condition is said to occur. <hepta-color type="text" color="blue">The objection mechanism is most commonly used in the UVM phasing mechanism</hepta-color> to coordinate the end of each run-time phase. User-processes started in a phase raises an objection first and drops the objection once the process completes. <hepta-color type="text" color="green">When all processes in a phase drops the objects, the phase’s objection count goes to zero.</hepta-color> This “all dropped” condition indicates to the phasing mechanism that every participant agrees the phase should be ended.
545	
546	> [How to Terminate UVM Test? (UVM Objections)](https://theartofverification.com/how-to-terminate-uvm-test-uvm-objections/)
547	
548	Following is an example of how a sequence ( `my_test_sequence` ) is started on a sequencer ( `my_sequencer` ) and the objection is dropped after sequence completes execution
549	
550	```
551	task main_phase( uvm_phase phase);
552	  phase.raise_objection( this );
553	  my_test_sequence.start(my_sequencer);
554	  phase.drop_objection( this );
555	endtask
556	
557	```
558	
559	### **30.** **How can we implement a simulation timeout mechanism in UVM methodology?**
560	
561	A simulation time out mechanism helps to stop the simulation if the test doesn’t progress because of some bug beyond a maximum time.
562	
563	In UVM, **`set_global_timeout(timeout)`**** **– is a convenience function that sets **`uvm_top.phase_timeout`**** **variable with the timeout value. If the `run_phase()` doesn’t end before this timeout value, then the simulation is stopped and an error is reported. This function is called in the top-level module which also starts the test as follows
564	
565	```verilog
566	module test;
567	  initial begin
568	    set_global_timeout(1000ns);
569	  end
570	  initial begin
571	    run_test();
572	  end
573	endmodule
574	
575	```
576	
577	### **31.** **What is the concept of phasing in UVM methodology** **and explain the different phases of a UVM Component.**
578	
579	Please go through the below post to understand the Phasing concept in detail.
580	
581	> [UVM Phasing](https://theartofverification.com/uvm-phasing/)
582	
583	### **32.** **Why is build\_phase() executed top down in uvm\_component hierarchy?**
584	
585	In UVM, all the testbench components like a test, Env, Agent, Driver, Sequencer are based on the `uvm_component` class and there is always a hierarchy for the testbench components. The `build_phase()` method is part of the `uvm_component` class and is used to construct all the child components from the parent component. So, <hepta-color type="text" color="green">to build the testbench hierarchy </hepta-color><hepta-color type="background" color="yellow"><hepta-color type="text" color="green">you always need to have a parent object</hepta-color></hepta-color> first, which can then construct its children, and that can further construct its children using `build_phase`. Hence, `build_phase()` is always executed top-down.
586	
587	For Example: The top level uvm\_test class calls `build_phase` which should construct all the uvm\_env components part of this test, and the `build_phase()` of each uvm\_env class should construct all the uvm\_agent components that are part of that uvm\_env, and this goes on. For all other phases it really doesn’t matter in which order it is called. The `run_phase()` for all components runs in parallel.
588	
589	additional reasons config\_db needs to pass down from top and factory override must come first before the component create
590	
591	### **33.** **What is the use of phase\_ready\_to\_end() method in a uvm\_component class?**
592	
593	**`phase_ready_to_end(uvm_phase phase)`**** **is a callback method available in a component class that gets called when all objections are dropped for that corresponding phase and the phase is going to end.
594	
595	A component class can use this callback method to define any functionality that it needs to perform when the phase is about to end.
596	
597	One example is if a component want to delay ending of phase until some condition even after all objections are dropped, it can be done using this callback method.
598	
599	Another example is if an irritator or reactive sequence is running until a main sequence is complete, `phase_ready_to_end()` callback method in `main_phase()` can be used to stop those irritator sequences.
600	
601	### **34.** **What is uvm\_config\_db and what is it used for?**
602	
603	The UVM configuration mechanism supports sharing of configurations and parameters across different testbench components. This is enabled using a configuration database called `uvm_config_db`. Any testbench component can populate the configuration database with variables, parameters, object handles, etc. Other testbench components can get access to these variables, parameters, and object handles from the configuration database without really knowing where it exists in the hierarchy. For Example, a top-level testbench module can store a virtual interface pointer to the `uvm_config_db`. Then any uvm\_driver or a `uvm_monitor` component can query the `uvm_config_db` to get a handle to this virtual interface and use it for actually accessing the signals through the interface.
604	
605	> [uvm\_config\_db and uvm\_resource\_db](https://theartofverification.com/uvm_config_db-and-uvm_resource_db/)
606	
607	### **35.** **How do we use the get() and set() methods of uvm\_config\_db?**
608	
609	The get() and set() are the primary methods used to populate or retrieve information from the uvm\_config\_db. Any verification component can use the **set() **method to populate the config\_db with some configuration information and can also control which other components will have visibility to the same information. It could be set to have global visibility or visible only to one or more specific testbench components. The get() function checks for a shared configuration from the database matching the parameters.
610	
611	The syntax for the get() and set() methods are as follows:
612	
613	```
614	uvm_config_db#(<type>)::set(uvm_component context, string inst_name, string field_name,<type> value)
615	uvm_config_db#(<type>)::get(uvm_component context, string inst_name, string field_name, ref value)
616	```
617	
618	The *context *specifies the current class or component from which get/set is called.
619	
620	The *inst\_name *is the name of the instance of a component from which get/set is called.
621	
622	The *field\_name *is the name of the object or parameter or variable which is set/get in config\_db.
623	
624	The <type> identifies the type of the configuration information set/get in config\_db. For object handles, this will have the class name while for other variables; it will be the type of that variable.
625	
626	### **36.** **Is it possible for a component lower in testbench hierarchy to pass a handle to a component in higher level of hierarchy using get/set config methods?**
627	
628	This is not a recommended way of passing configuration objects in UVM. Normally the higher level component sets up configuration data base with handles and the lower level components do get them using get/set methods.
629	
630	### **37.** **What is the recommended way of assigning virtual interfaces to different components in a UVM verification methodology?**
631	
632	The top-level testbench module which instantiates the DUT and interfaces will set the virtual interface in the `uvm_config_db`. A test class or any other component in the UVM component hierarchy can then query the `uvm_config_db` using the `get()` method to get handles to this virtual interface and use them for accessing signals. The following shows an example of how this is done. The module test actually instantiates a DUT and physical interface for an APB bus master. It then sets the virtual interface handle to the `uvm_config_db`.
633	
634	```verilog
635	module test;
636	  logic pclk;
637	  logic [31:0] paddr;
638	  //Instantiate an APB bus master DUT
639	  apb_master apb_master(.pclk(pclk),*);
640	  //Instantiate a physical interface for APB interface
641	  apb_if apb_if(.pclk(pclk), *);
642	  initial begin
643	    //Pass this physical interface to test class top
644	    //which will further pass it down to env->agent->drv/sqr/mon
645	    uvm_config_db#(virtual apb_if)::set(null, “uvm_test_top”, “vif”, apb_if);
646	  end
647	endmodule
648	
649	// Following shows a APB Env class that uses the get() method in uvm_config_db to
650	// retrieve the virtual interface that was set in the top level test module.
651	
652	class apb_env extends uvm_env;
653	  `uvm_component_utils(apb_env);
654	  //ENV class will have agent as its sub component
655	  apb_agent agt;
656	  //virtual interface for APB interface
657	  virtual apb_if vif;
658	  //Build phase - Construct agent and get virtual interface handle from test and
659	  pass it down to agent
660	  function void build_phase(uvm_phase phase);
661	    agt = apb_agent::type_id::create(“agt”, this);
662	    if (!uvm_config_db#(virtual apb_if)::get(this, ””, “vif”, vif))
663	    begin
664	      `uvm_fatal(“config_db_err”, “No virtual interface specified for this env instance”)
665	    end
666	    uvm_config_db#(virtual apb_if)::set( this, “agt”, “vif”, vif);
667	  endfunction: build_phase
668	endclass : apb_env
669	```
670	
671	### **38.** **Explain how simulation ends in UVM methodology?**
672	
673	UVM has a phased execution which consists of a set of build phases, run phases and check phases. The `run_phase` is where the actual test simulation happens and during this phase every component can raise an objection in beginning and hold it until it is done with its activity. Once all components drops the objection, the `run_phase` completes and then `check_phase` of all components execute and then the test ends.
674	
675	This is how a normal simulation ends, but there are also controls on simulation timeouts to terminate the `run_phase` if some component hangs due to a bug in design or testbench. When the `run_phase` starts, a parallel timeout timer is also started. If the timeout timer reaches one of the specified timeout limits before the `run_phase` completes, the `run_phase` will timeout, an error message will be issued and then all phases post run() will get executed and test ends after that.
676	
677	**39.** **What is UVM RAL (UVM Register Abstraction Layer)?**
678	
679	UVM RAL (Register Abstraction Layer) is a feature supported in UVM that helps in verifying the registers in a design as well as in configuration of DUT using an abstract register model.
680	
681	The UVM register model provides a way of tracking the register content of a DUT and a convenience layer for accessing register and memory locations within the DUT. The register model abstraction reflects the structure of the design specification for registers which is a common reference for hardware and software engineers working on the design.
682	
683	Some other features of RAL include support for both front door and back door initialization of registers and built in functional coverage support.
684	
685	> [How UVM RAL works?](https://theartofverification.com/uvm-ral-overview/)
686	
687	**40.** **What is UVM Call back?**
688	
689	The `uvm_callback` class is a base class for implementing callbacks, <hepta-color type="background" color="green">which are typically used to modify or augment component behavior without changing the component class.</hepta-color> Typically, the component developer defines an application-specific callback class that extends from this class and defines one or more virtual methods, called as *callback* *interface*. The methods are used to implement overriding of the component class behavior. One common usage can be to inject an error into a generated packet before the driver sends it to DUT. Following pseudo code shows how this can be implemented.
690	
691	\1) Define the `packet class` with an error bit
692	
693	\2) Define the `driver class` that receives this packet from a sequence and sends it to DUT
694	
695	\3) Define a `driver callback class` derived from the base `uvm_callback` class and add a virtual method which can be used to inject an error or flip a bit in the packet.
696	
697	\4) Register the callback class using `` `uvm_register_cb() `` macro 
698	
699	\5) In the run() method of driver that receives and send the packet to the DUT, based on a probability knob, execute the callback to cause a packet corruption
700	
701	```verilog
702	class Packet_c extends uvm_sequence_item;
703	  `uvm_object_utils(Packet_c)
704	  byte src_addr[4], dst_addr[4];
705	  byte data[];
706	  byte crc[4];
707	  function new(string name = "Packet_c");
708	    super.new(name);
709	  endfunction
710	endclass
711	
712	// Base callback: an empty hook, the "slot"
713	class PktDriver_Cb extends uvm_callback;
714	  function new(string name = "PktDriver_Cb");
715	    super.new(name);
716	  endfunction
717	  virtual task corrupt_packet(Packet_c pkt);
718	  endtask
719	endclass
720	
721	// Error-injection callback: supplied by the test
722	class CrcErr_Cb extends PktDriver_Cb;
723	  function new(string name = "CrcErr_Cb");
724	    super.new(name);
725	  endfunction
726	  virtual task corrupt_packet(Packet_c pkt);
727	    pkt.crc[0][0] = ~pkt.crc[0][0];   // flip bit 0 of CRC byte 0
728	  endtask
729	endclass
730	
731	class PktDriver extends uvm_driver #(Packet_c);
732	  `uvm_component_utils(PktDriver)
733	  `uvm_register_cb(PktDriver, PktDriver_Cb)
734	
735	  function new(string name, uvm_component parent = null);
736	    super.new(name, parent);
737	  endfunction
738	
739	  virtual task run_phase(uvm_phase phase);
740	    Packet_c pkt;
741	    forever begin
742	      seq_item_port.get_next_item(pkt);
743	      `uvm_do_callbacks(PktDriver, PktDriver_Cb, corrupt_packet(pkt))
744	      // drive pkt to DUT ...
745	      seq_item_port.item_done();
746	    end
747	  endtask
748	endclass
749	
750	// In the error test
751	class crc_err_test extends base_test;
752	  `uvm_component_utils(crc_err_test)
753	  CrcErr_Cb cb;
754	  function void connect_phase(uvm_phase phase);
755	    cb = CrcErr_Cb::type_id::create("cb");
756	    uvm_callbacks#(PktDriver, PktDriver_Cb)::add(env.agt.drv, cb);
757	  endfunction
758	endclass
759	```
760	
761	### **41.** **What is uvm\_root class?**
762	
763	The **uvm\_root **class serves as the implicit top-level and phase controller for all UVM components. Users do not directly instantiate **uvm\_root. **The UVM automatically creates a single instance of uvm\_root that users can access via the global (uvm\_pkg-scope) variable, **uvm\_top **.
764	
765	### **42.** **What is the parent class for uvm\_test?**
766	
767	`uvm_test` class is the top-level class that a user can implement and there is no explicit parent that is mentioned. However, UVM has a special component called `uvm_top` and it is assigned as the parent of the test class.
768	
769	uvm\_component <- uvm\_test <- my\_test
770	
771	## Quick reference tables
772	
773	These tables condense the answers above into fast revision aids for the day before an interview.
774	
775	### Driver-sequencer API: blocking vs non-blocking
776	
777	| Method | Blocking? | What it does |
778	| --- | --- | --- |
779	| get\_next\_item() | Blocking | Waits for an item; needs a matching item\_done() |
780	| try\_next\_item() | Non-blocking | Returns null if no item is ready |
781	| get() | Blocking | Gets an item; completes the handshake implicitly |
782	| peek() | Blocking | Returns the item but leaves it in the FIFO |
783	| item\_done() | Non-blocking | Completes the handshake after get\_next\_item/try\_next\_item |
784	| put() | Non-blocking | Sends a response back to the sequence |
785	
786	### Active vs passive agent
787	
788	| Aspect | Active agent | Passive agent |
789	| --- | --- | --- |
790	| Sequencer and driver | Constructed | Not constructed |
791	| Generates stimulus | Yes | No |
792	| Monitor | Present | Present |
793	| Typical use | Block level, where stimulus is needed | Chip level, monitor and coverage only |
794	
795	### copy vs clone vs create
796	
797	| Method | What it does |
798	| --- | --- |
799	| create() | Constructs a new object (through the factory) |
800	| copy() | Copies one existing object into another existing object |
801	| clone() | Creates a new object and copies into it (create then copy) |
802	
803	### Type override vs instance override
804	
805	| Aspect | Type override | Instance override |
806	| --- | --- | --- |
807	| Scope | Every instance of that component type | One specific instance by hierarchy path |
808	| Applies to | Components and objects/sequences | Components only (they have hierarchy) |
809	| Use when | You want to swap a class everywhere | You want to swap just one place |
810	
811	## A worked example: config\_db virtual interface passing
812	
813	Passing the virtual interface from the top module down to the driver is the single most common UVM setup step, and a frequent interview question. Here is the pattern end to end: the top module sets it, and each component gets it.
814	
815	```
816	// Top module: set the virtual interface into the config DB
817	module tb_top;
818	  apb_if apb_if_inst(.pclk(pclk));
819	  initial begin
820	    uvm_config_db#(virtual apb_if)::set(null, "uvm_test_top", "vif", apb_if_inst);
821	    run_test();
822	  end
823	endmodule
824	
825	// Driver: get the same virtual interface in build_phase
826	class apb_driver extends uvm_driver #(apb_item);
827	  virtual apb_if vif;
828	  function void build_phase(uvm_phase phase);
829	    super.build_phase(phase);
830	    if (!uvm_config_db#(virtual apb_if)::get(this, "", "vif", vif))
831	      `uvm_fatal("NOVIF", "virtual interface not set for driver")
832	  endfunction
833	endclass
834	```
835	
836	Expected output, in plain words: if the top module set the interface, the driver get() returns 1 and vif points to the real interface; if it was not set, the get() returns 0 and the uvm\_fatal stops the run with a clear message. Note: this describes intended behaviour from a read of the code and the UVM 1800.2 rules, not a captured simulator run, so confirm on your own tool.
837	
838	## Keep practising
839	
840	Revise one group at a time, then rebuild a small testbench from memory to lock it in. Combine this page with the deeper [UVM](https://theartofverification.com/category/uvm/) posts on phasing, the factory, config\_db, and RAL, and with the full set of [interview questions](https://theartofverification.com/category/interview-questions/).
841	
842	## Frequently asked questions
843	
844	### What is the difference between a sequence and a sequence item in UVM?
845	
846	A sequence item is a single transaction, such as one read or write, with its own data fields. A sequence is a class whose body() creates and sends a series of sequence items to define a scenario. So the item is one unit of stimulus, and the sequence is the ordered collection of those units.
847	
848	### What is the difference between get\_next\_item() and get() in a UVM driver?
849	
850	Both are blocking calls that fetch a sequence item from the sequencer. get\_next\_item() requires the driver to call item\_done() afterward to complete the handshake, while get() completes the handshake implicitly, so no separate item\_done() is needed.
851	
852	### Why should a class be registered with the UVM factory?
853	
854	Registration lets you create the object with type\_id::create(), which the factory can override at run time. This means a base class can be substituted with a derived class without editing or recompiling the testbench. Without registration you cannot use the factory create mechanism or overrides.
855	
856	### What is the difference between a type override and an instance override?
857	
858	A type override replaces every instance of a component type across the whole testbench. An instance override replaces only one specific instance, identified by its position in the component hierarchy. Only components can be instance-overridden because only they have hierarchy; sequences and objects can only be type-overridden.
859	
860	### What are UVM objections used for?
861	
862	Objections coordinate the end of a run-time phase. A process raises an objection when it starts work and drops it when done. When the objection count returns to zero, the phase ends. This is how UVM knows every participant agrees a phase is finished.
863	
864	### What is uvm\_config\_db used for?
865	
866	It is a database that shares configuration data, parameters, and object handles across the testbench without components needing to know each other’s location. The most common use is passing a virtual interface from the top module down to the driver and monitor.
867	
868	### What is the difference between an active and a passive UVM agent?
869	
870	An active agent constructs its sequencer and driver and generates stimulus, so it is used at block level. A passive agent constructs neither and only monitors, so it is used at chip level where stimulus already comes from elsewhere but you still want monitoring and coverage.
871	
872	### What is UVM RAL?
873	
874	UVM RAL (Register Abstraction Layer) is an abstract model of a design’s registers and memories. It tracks register contents, offers a convenient layer to read and write registers through front-door or back-door access, and provides built-in functional coverage, giving hardware and software teams a shared register reference.
875	
876	I tried to reframe questions and answers from Semiconductor Industry experts and **all Credit goes to the original author’s work is a crucial part of ethical writing and research who’s nonother than** **Mr. Robin Garg and Mr. Ramdas Mozhikunnath**‘s knowledge and exposure to the semiconductor industry over the last so many years. I really like the way they shared their knowledge with the engineers who are in VLSI Domain.
877	
878	I didn’t cover a few topics in this section just because I already posted multiple conceptual posts in UVM sections so please refer to that as well. See you guys 🙂
879	
880	**Books to refer to learn UVM in more detail:**
881	
882	1. Getting Started with UVM: A Beginner’s Guide by Vanessa Cooper – [https://amzn.to/39H4PMF](https://amzn.to/39H4PMF)
883	
884	2. A Practical Guide to Adopting the Universal Verification Methodology (UVM) – [https://amzn.to/3NapXZl](https://amzn.to/3NapXZl)
885	
886	3. The UVM Primer: A Step-by-Step Introduction to the Universal Verification Methodology by Ray Salemi – [https://amzn.to/3QE2FOf](https://amzn.to/3QE2FOf)
887	
888	4. Practical UVM: Step by Step Examples – [https://amzn.to/3zYilGj](https://amzn.to/3zYilGj)
889	
890	5. Advanced UVM – [https://amzn.to/3yayPda](https://amzn.to/3yayPda)
891	
892	6. Cracking Digital VLSI Verification Interview: Interview Success – [https://amzn.to/39Ec1Jy](https://amzn.to/39Ec1Jy)
893	
894	7. Writing Testbenches: Functional Verification of HDL Models – [https://amzn.to/3yazivW](https://amzn.to/3yazivW)
895	
896	8. Formal Verification: An Essential Toolkit for Modern VLSI Design – [https://amzn.to/3QDPE7t](https://amzn.to/3QDPE7t)
897	
898	
899	Source: [https://theartofverification.com/uvm-interview-questions/](https://theartofverification.com/uvm-interview-questions/)
900	
901	
