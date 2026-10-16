whiteboard "DV Interview" [cb101ccc-d3a3-4928-8eb4-da4ad45f2167] Parent: "1. Projects" [aa01e23f-f82e-43f6-bd0f-f2eb54020e0d]
cards: 42 (card: 29, pdfCard: 13); other objects: 9 (section: 9)

section "ChipVerify" [020ac427-a849-446d-8470-7a1bef87a5bd]
  card "UVM Interview Questions Set 1" [f1def09c-0a10-4684-8930-830e02cb8fd7] 65 lines
    1	# UVM Interview Questions Set 1
    2	
    3	Source: [https://chipverify.com/uvm/uvm-interview-questions-set-1](https://chipverify.com/uvm/uvm-interview-questions-set-1)
    4	
    5	- [What is a UVM RAL model ? Why is it required ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-a-uvm-ral-model-why-is-it-required)
    6	
    7	- [What is ](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-p-sequencer-and-where-is-it-used)[*p\_sequencer*](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-p-sequencer-and-where-is-it-used)[, and where is it used ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-p-sequencer-and-where-is-it-used)
    8	
    9	- [What is an analysis port ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-an-analysis-port)
    10	
    11	- [What is the difference between ](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-the-difference-between-new-and-create)[*new()*](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-the-difference-between-new-and-create)[ and ](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-the-difference-between-new-and-create)[*create()*](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-the-difference-between-new-and-create)[ ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-the-difference-between-new-and-create)
    12	
    13	- [Is UVM independent of SystemVerilog ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#is-uvm-independent-of-systemverilog)
    14	
    15	- [Why do we need to register a class with a factory ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#why-do-we-need-to-register-a-class-with-a-factory)
    16	
    17	- [What are Active and Passive modes in an agent ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-are-active-and-passive-modes-in-an-agent)
    18	
    19	- [What is a TLM Fifo ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-is-a-tlm-fifo)
    20	
    21	- [What are the advantages of ](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-are-the-advantages-of-uvm-component-utils-and-uvm-object-utils)[*`uvm\_component\_utils* and *`*](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-are-the-advantages-of-uvm-component-utils-and-uvm-object-utils)[*uvm\_object\_utils*](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-are-the-advantages-of-uvm-component-utils-and-uvm-object-utils)[ ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#what-are-the-advantages-of-uvm-component-utils-and-uvm-object-utils)
    22	
    23	- [How does a sequence start ?](https://chipverify.com/uvm/uvm-interview-questions-set-1#how-does-a-sequence-start)
    24	
    25	## What is a UVM RAL model ? Why is it required ?
    26	
    27	RAL is short for Register Abstraction Layer. It is a set of base classes that can be used to create register models to mimic the register contents in a design. It is much easier to write and read from the design using a register model than sending a bus transaction for every read and write. Also the register model stores the current state of the design in a local copy called as a *mirrored* value. Read more in [Register Layer](https://chipverify.com/uvm/uvm-register-layer).
    28	
    29	## What is *p\_sequencer*, and where is it used ?
    30	
    31	`p_sequencer` is a handle to the sequencer on which the current sequence should be executed and is made available in a sequence by the macro `` `uvm_declare_p_sequencer ``. It is typically accessed within sequences to start other sequences.
    32	
    33	## What is an analysis port ?
    34	
    35	An analysis port is a TLM mechanism to allow a component to broadcast a class object to multiple listeners so that they can implement different methods to perform different operations on the data it receives. Read more in [TLM Analysis Port](https://chipverify.com/uvm/uvm-tlm-analysis-port)
    36	
    37	## What is the difference between *new()* and *create()* ?
    38	
    39	The `new()` method is the classical way of how SV creates an object instance. The `create()` is an addition in UVM that allows the factory to return an object of the type that we want. Read more in [Using factory overrides](https://chipverify.com/uvm/uvm-factory-override).
    40	
    41	## Is UVM independent of SystemVerilog ?
    42	
    43	No. UVM is built on SystemVerilog and hence you cannot run UVM with any tool that does not support SystemVerilog.
    44	
    45	## Why do we need to register a class with a factory ?
    46	
    47	You don't necessarily need to. It is registered with a factory simply to make the testbench more re-usable and have the capability to override it with some other derivative component later on. Read more in [Using factory overrides](https://chipverify.com/uvm/uvm-factory-override).
    48	
    49	## What are Active and Passive modes in an agent ?
    50	
    51	An *agent* typically consists of a driver, sequencer and a monitor. At times, we don't want the agent to drive anything to the DUT but simply monitor the signals on the interface. This is a passive agent where sequencer and driver are not instantiated at all. An active agent is when it can run sequences on its sequencer, drive signals and monitor the interface.
    52	
    53	Read more on [UVM Agent](https://chipverify.com/uvm/uvm-agent).
    54	
    55	## What is a TLM Fifo ?
    56	
    57	When two components at different clocks need to be operating independently, you have to insert a TLM FIFO in between. One component can send data at a faster rate while the other component can receive at a slower rate. Read more in [TLM Fifo](https://chipverify.com/uvm/uvm-tlm-fifo)
    58	
    59	## What are the advantages of *`uvm\_component\_utils* and *`**uvm\_object\_utils* ?
    60	
    61	These macros are used to register a class with the factory. `` `uvm_component_utils `` is used when the class is a *component* derived from `uvm_component`, and `` `uvm_object_utils `` is used if it's an object derived from `uvm_object`. There are no advantages from one over the other but are separate ways to register with the factory. Read more in [Using factory overrides](https://chipverify.com/uvm/uvm-factory-override).
    62	
    63	## How does a sequence start ?
    64	
    65	A sequence can be started by calling its `start()` method or by using the macro `` `uvm_do ``. Read more in [Executing sequences via start()](https://chipverify.com/uvm/how-to-execute-sequences-via-start-method) and [Executing sequences via macros](https://chipverify.com/uvm/how-to-execute-sequences-via-uvm-do-macros)
  card "UVM Interview Questions Set 3" [4ef63478-e5c2-4866-9ee0-499a6d2e3cd2] 75 lines
    1	# UVM Interview Questions Set 3
    2	
    3	Source: [https://chipverify.com/uvm/uvm-interview-questions-set-3](https://chipverify.com/uvm/uvm-interview-questions-set-3)
    4	
    5	- [How can we access a DUT signal in a component or sequence ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#how-can-we-access-a-dut-signal-in-a-component-or-sequence)
    6	
    7	- [What is RALGEN and how do you use it ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-is-ralgen-and-how-do-you-use-it)
    8	
    9	- [What are desired and mirrored values in RAL ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-are-desired-and-mirrored-values-in-ral)
    10	
    11	- [What are ](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-are-reg2bus-and-bus2reg-functions-for)[*reg2bus*](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-are-reg2bus-and-bus2reg-functions-for)[ and ](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-are-reg2bus-and-bus2reg-functions-for)[*bus2reg*](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-are-reg2bus-and-bus2reg-functions-for)[ functions for ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-are-reg2bus-and-bus2reg-functions-for)
    12	
    13	- [How would you debug a config db name or path mismatch problem ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#how-would-you-debug-a-config-db-name-or-path-mismatch-problem)
    14	
    15	- [What are the different TB components in UVM ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-are-the-different-tb-components-in-uvm)
    16	
    17	- [Which UVM phase takes more time and why ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#which-uvm-phase-takes-more-time-and-why)
    18	
    19	- [How do you connect a monitor with a scoreboard ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#how-do-you-connect-a-monitor-with-a-scoreboard)
    20	
    21	- [How do you connect driver and sequencer ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#how-do-you-connect-driver-and-sequencer)
    22	
    23	- [What is ](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-is-uvm-config-db-and-uvm-resource-db)[*uvm\_config\_db*](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-is-uvm-config-db-and-uvm-resource-db)[ and ](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-is-uvm-config-db-and-uvm-resource-db)[*uvm\_resource\_db*](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-is-uvm-config-db-and-uvm-resource-db)[ ?](https://chipverify.com/uvm/uvm-interview-questions-set-3#what-is-uvm-config-db-and-uvm-resource-db)
    24	
    25	## How can we access a DUT signal in a component or sequence ?
    26	
    27	Interface signals can be accessed via a virtual interface handle that points to the actual physical interface. Signals within the DUT can be accessed directly by providing a hierarchical RTL path to `uvm_hdl_*` functions such as.
    28	
    29	```systemverilog
    30	uvm_hdl_force("top.eatable.fruits.apple.slice", 2);
    31	uvm_hdl_deposit("top.eatable.fruits.apple.slice", 3);
    32	uvm_hdl_read("top.eatable.fruits.apple.slice", rdata);
    33	```
    34	
    35	## What is RALGEN and how do you use it ?
    36	
    37	RALGEN is a Synopsys tool to generate RAL model from an IPXACT specification file. You simply have to specify a few options and select the block for which you need to generate class structure for and provide them to the tool.
    38	
    39	Read more about [register model](https://chipverify.com/uvm/uvm-register-model) !
    40	
    41	## What are desired and mirrored values in RAL ?
    42	
    43	Desired values are those that we want the design to have, and can later update the design with. Mirrored values are those that reflect the latest known values in the DUT.
    44	
    45	Read more about [desired and mirrored values](https://chipverify.com/uvm/uvm-register-model) !
    46	
    47	## What are *reg2bus* and *bus2reg* functions for ?
    48	
    49	They are RAL functions that enable conversion from generic register contents to actual bus transactions and vice-versa. You have to define them based on the protocol you are dealing with by assigning the data object of the protocol with values from `rw` internal variable and vice-versa.
    50	
    51	## How would you debug a config db name or path mismatch problem ?
    52	
    53	You can use the command-line define `+UVM_CONFIG_DB_TRACE` to dump information related to all SET and GET calls done on the configuration DB. It also shows you the path, and instance that makes the call.
    54	
    55	## What are the different TB components in UVM ?
    56	
    57	Some of the major components are driver, monitor, scoreboard, sequencer, agent, environment, test and sequences.
    58	
    59	Read more on [UVM Introduction](https://chipverify.com/uvm/uvm-introduction).
    60	
    61	## Which UVM phase takes more time and why ?
    62	
    63	Run time phases take more time because they are the major phases that consume simulation time. The times taken for each test can be different because they all test different aspects of a design.
    64	
    65	## How do you connect a monitor with a scoreboard ?
    66	
    67	You can declare the implementation of an analysis port within a scoreboard and connect the monitor's analysis port with it in the environment's connect method.
    68	
    69	## How do you connect driver and sequencer ?
    70	
    71	Driver has a TLM port called `seq_item_port` that can be connected with the sequencer's `seq_item_export` in an agent's connect method.
    72	
    73	## What is *uvm\_config\_db* and *uvm\_resource\_db* ?
    74	
    75	Both are mechanisms that allow a component to place an object in a central look-up table under a specified *name* and *path*, so that they can be retrieved by another component using the same *name* and *path*. The `uvm_config_db` class provides a convenience interface on top of the `uvm_resource_db` to simplify the basic interface that is used for configuring `uvm_component` instances.
  card "UVM Interview Questions Set 2" [95124f05-394f-45ed-9cd2-b8c98ea39960] 119 lines
    1	# UVM Interview Questions Set 2
    2	
    3	Source: [https://chipverify.com/uvm/uvm-interview-questions-set-2](https://chipverify.com/uvm/uvm-interview-questions-set-2)
    4	
    5	- [What are the different phases in UVM ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-are-the-different-phases-in-uvm)
    6	
    7	- [What is a virtual sequence and a virtual sequencer ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-a-virtual-sequence-and-a-virtual-sequencer)
    8	
    9	- [What is the difference between ](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-do-and-uvm-send)[*`uvm\_do* and *`*](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-do-and-uvm-send)[*uvm\_send*](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-do-and-uvm-send)[ ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-do-and-uvm-send)
    10	
    11	- [What is the difference between ](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-transaction-and-uvm-sequence-item)[*uvm\_transaction*](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-transaction-and-uvm-sequence-item)[ and ](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-transaction-and-uvm-sequence-item)[*uvm\_sequence\_item*](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-transaction-and-uvm-sequence-item)[ ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-uvm-transaction-and-uvm-sequence-item)
    12	
    13	- [What are the benefits of using UVM ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-are-the-benefits-of-using-uvm)
    14	
    15	- [Is it possible to have a user defined phase in UVM ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#is-it-possible-to-have-a-user-defined-phase-in-uvm)
    16	
    17	- [What is the difference between RAL backdoor and frontdoor accesses ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-ral-backdoor-and-frontdoor-accesses)
    18	
    19	- [What is a phase objection ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-a-phase-objection)
    20	
    21	- [What is the difference between ](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-set-config-and-uvm-config-db)[*set\_config\_\**](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-set-config-and-uvm-config-db)[ and ](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-set-config-and-uvm-config-db)[*uvm\_config\_db*](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-set-config-and-uvm-config-db)[ ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-is-the-difference-between-set-config-and-uvm-config-db)
    22	
    23	- [What are the different factory override types ?](https://chipverify.com/uvm/uvm-interview-questions-set-2#what-are-the-different-factory-override-types)
    24	
    25	## What are the different phases in UVM ?
    26	
    27	The main phases in UVM are :
    28	
    29	- build\_phase
    30	
    31	- connect\_phase
    32	
    33	- end\_of\_elaboration\_phase
    34	
    35	- start\_of\_simulation\_phase
    36	
    37	- run\_phase
    38	
    39	- extract\_phase
    40	
    41	- check\_phase
    42	
    43	- report\_phase
    44	
    45	- final\_phase
    46	
    47	Read more in [UVM Phases](https://chipverify.com/uvm/uvm-phases).
    48	
    49	## What is a virtual sequence and a virtual sequencer ?
    50	
    51	A virtual sequence is a container to hold and execute multiple other smaller sequences. A virtual sequencer is a container to hold the handles to other sequencers in an environment so that each sequence in a virtual sequence can be executed on the appropriate sequencer. Read more in [Virtual Sequence](https://chipverify.com/uvm/uvm-virtual-sequence) and [Virtual Sequencer](https://chipverify.com/uvm/uvm-virtual-sequencer)
    52	
    53	## What is the difference between *`uvm\_do* and *`**uvm\_send* ?
    54	
    55	`` `uvm_do `` macro will automatically create a new object, randomize it and send to the the sequencer. `` `uvm_send `` is used when the object is already created and randomized but needs to be executed on a sequencer. Read more in [How to execute sequences via \`uvm\_do macros ?](https://chipverify.com/uvm/how-to-execute-sequences-via-uvm-do-macros) and [Sequence action macros for pre-existing items](https://chipverify.com/uvm/sequence-action-macros-for-pre-existing-items)
    56	
    57	## What is the difference between *uvm\_transaction* and *uvm\_sequence\_item* ?
    58	
    59	The `uvm_transaction` class is the root base class for UVM transactions and has a timing and recording interface as well. Use of this class as a base for user-defined transactions is deprecated, and instead its sub-class `uvm_sequence_item` should be used. The intended use of transaction API is to call `accept_tr`, `begin_tr` and `end_tr` during the course of sequence item execution in order to record the events to a vendor-specific transaction database. `uvm_sequence_item` is primarily used to define data objects and related methods.
    60	
    61	## What are the benefits of using UVM ?
    62	
    63	Some of the major and immediate benefits are :
    64	
    65	- Testbench prototyping becomes faster because of all the base classes for drivers, monitors, sequencers
    66	
    67	- There's a well defined reporting system which supports various levels of verbosities like LOW, DEBUG, etc
    68	
    69	- Supports register model creation and maintainence which simplifies the way DUT registers are accessed
    70	
    71	- Well structured plug and play style components like agents that can be plugged into any environment to support a particular protocol
    72	
    73	- Factory helps to override certain components without having to modify existing connections in the testbench
    74	
    75	- Configuration databases that allow components to share objects and data between each other
    76	
    77	- Make use of TLM features that enable different components that receive transactions to perform different operations on it.
    78	
    79	- Promotes re-usability, flexibility, uniformity and robustness to every testbench built on UVM
    80	
    81	## Is it possible to have a user defined phase in UVM ?
    82	
    83	Yes, you can define your own phase and insert it between any of the existing phases. For this, you have to first define a new phase class inherited from `uvm_task_phase`, implement the `exec_task` or `exec_func` method and insert the phase into existing schedule or domain object.
    84	
    85	Read more on [Creating user-defined phases](https://chipverify.com/uvm/uvm-user-defined-phase).
    86	
    87	## What is the difference between RAL backdoor and frontdoor accesses ?
    88	
    89	A backdoor access in RAL is a way to dump values directly onto the DUT registers via a hard coded RTL signal path and does not consume simulation time. A frontdoor access in RAL is usually done by sending the data as a transaction through an associated peripheral bus interface and hence consumes simulation time.
    90	
    91	## What is a phase objection ?
    92	
    93	In UVM, all components synchronize with each other through a set of phases. Every component has to finish its processes in a particular phase until it can proceed to the next. So, objection is a mechanism to allow a component to stall other components from proceeding to the next phase until it gets the chance to finish its own tasks. This is normally done using `raise_objection()` and `drop_objection()` methods from the `uvm_phase` class.
    94	
    95	## What is the difference between *set\_config\_\** and *uvm\_config\_db* ?
    96	
    97	The basic `set_config_*` methods are mapped to corresponding `uvm_config_db` as :
    98	
    99	```systemverilog
    100	set_config_int(...) => uvm_config_db#(uvm_bitstream_t)::set(cntxt,...)
    101	set_config_string(...) => uvm_config_db#(string)::set(cntxt,...)
    102	set_config_object(...) => uvm_config_db#(uvm_object)::set(cntxt,...)
    103	```
    104	
    105	## What are the different factory override types ?
    106	
    107	Factory overrides can be done in four different ways:
    108	
    109	- Instance override by type of the component/object
    110	
    111	- Instance override by name of the component/object
    112	
    113	- Type override by type of the component/object
    114	
    115	- Type override by name of the component/object
    116	
    117	Note that calling `create()` with a single argument omits the context needed for an instance override for an object. To provide this context, you can either pass this as the second argument to use the current component's path, or supply a third argument to define an explicit absolute path string.
    118	
    119	Read more on [UVM Factory Override](https://chipverify.com/uvm/uvm-factory-override).
  card "UVM Interview Questions Set 4" [dcf7a2ca-2d13-473a-99bd-23adde69faed] 39 lines
    1	# UVM Interview Questions Set 4
    2	
    3	Source: [https://chipverify.com/uvm/uvm-interview-questions-set-4](https://chipverify.com/uvm/uvm-interview-questions-set-4)
    4	
    5	- [Write pseudo code for implementing an AHB-Lite driver.](https://chipverify.com/uvm/uvm-interview-questions-set-4#write-pseudo-code-for-implementing-an-ahb-lite-driver)
    6	
    7	- [What does a sequence normally contain ?](https://chipverify.com/uvm/uvm-interview-questions-set-4#what-does-a-sequence-normally-contain)
    8	
    9	## Write pseudo code for implementing an AHB-Lite driver.
    10	
    11	The main point in writing an AHB driver is to realize that its a pipelined protocol and hence address phase of the next transaction should be active when the data phase of current transaction is on going. This is done by starting the same task twice in a `fork join`.
    12	
    13	```systemverilog
    14	class ahb_driver extends uvm_driver;
    15		semaphore sema4;
    16		
    17		virtual task run_phase (uvm_phase phase);
    18			fork
    19				drive_tx();
    20				drive_tx();
    21			join
    22		endtask
    23		
    24		virtual task drive_tx();
    25			// 1. Get hold of a semaphore
    26			// 2. Get transaction packet from sequencer
    27			// 3. Drive the address phase
    28			// 4. Release semaphore
    29			
    30			// 5. Drive data phase
    31		endtask
    32	endclass
    33	```
    34	
    35	## What does a sequence normally contain ?
    36	
    37	A sequence has a task called `body()` within which we can write the actual stimulus to test the design for a particular feature.
    38	
    39	Read more on [UVM Sequence](https://chipverify.com/uvm/uvm-sequence).
section "rednote 同芯同行" [07e65ec1-1fa2-4aba-b041-d4cd2fc1bbaf]
  card "DV Python Scripting: A Beginner's Walkthrough" [f32a9fde-cb58-4074-8115-7afe95a2531b] 1751 lines
    1	# DV Python Scripting: A Beginner's Walkthrough
    2	
    3	This guide assumes you have never written a script. It explains the three interview problems line by line: what each line does, why it is there, and what would go wrong without it.
    4	
    5	Every script here was run, and every output shown is the real output.
    6	
    7	**Contents**
    8	
    9	- Part 0: What a script is and how to run one
    10	
    11	- Part 1: The Python you need (and nothing more)
    12	
    13	- Part 2: Problem 01, parse one log and decide PASS/FAIL
    14	
    15	- Part 3: Problem 02, summarize a whole directory into CSV/Excel
    16	
    17	- Part 4: Problem 03, pull the `metal_*` columns out of a table
    18	
    19	- Part 5: Try it yourself
    20	
    21	- Part 6: Cheat sheet
    22	
    23	---
    24	
    25	+ ## Part 0: What a script is and how to run one
    26	
    (more)
  card "UVM Coding Interview Sprint: 11 Questions" [abd805d1-68d4-4bda-bb4b-e52624080a6e] 886 lines
    1	# UVM Coding Interview Sprint: 11 Questions
    2	
    3	Each question follows the same layout: **Problem**, **Answer**, **Key points**, **Code**, and **Follow-ups** (the questions an interviewer typically asks next).
    4	
    5	> **Revision notes.** This version tightens the wording and fixes a few issues in the original material:
    6	>
    7	> - **Q01:** `priority` is a reserved SystemVerilog keyword, so the field is renamed `pri`.
    8	>
    9	> - **Q01 and Summary:** clarified when `super.build_phase()` creates the env.
    10	>
    11	> - **Q03:** the output skew is `#1` instead of `#1step`, since `1step` is meant for input sampling.
    12	>
    13	> - **Q04:** the follow-up about delaying data no longer suggests waiting on clocks inside a sequence, which contradicted Q08.
    14	>
    (more)
  card "TongXinTongXing DV Interview Question Bank" [afd37ea3-db52-4472-8b37-ae7ed449ba92] 54 lines
    1	# TongXinTongXing DV Interview Question Bank
    2	
    3	```plain
    4	Feb-July, 2026
    5	```
    6	
    7	381 source entries consolidated into 360 unique interview problems.
    8	Near-identical repeats were merged. Similar topics with different tasks were kept separate. Answers are included in the topic cards below.
    9	
    10	Each problem is a bullet with its answer in a nested bullet. The embedded topic cards below contain all 361 entries, including the supplemental question.
    11	
    12	## Digital Design & Computer Architecture
    13	
    14	<hepta-embed type="card" id="2c483f0f-20e3-4dd6-9f79-407b7d8b37d9">DV answers 1-116: Digital Design &amp; Computer Architecture</hepta-embed>
    15	
    16	## SystemVerilog Constraints & Randomization
    17	
    18	<hepta-embed type="card" id="c6961981-d3c9-4a2f-b1d0-c075e840d56d">DV answers 117-144: SystemVerilog Constraints &amp; Randomization</hepta-embed>
    19	
    20	## SystemVerilog Assertions
    21	
    22	<hepta-embed type="card" id="4c042c33-c682-44af-82ea-5a4e2320df0f">DV answers 145-160: SystemVerilog Assertions</hepta-embed>
    23	
    24	## SystemVerilog Coding & OOP
    25	
    26	<hepta-embed type="card" id="10e40154-635e-4d60-85fc-b7578a4d6b13">DV answers 161-203: SystemVerilog Coding &amp; OOP</hepta-embed>
    27	
    28	## UVM
    29	
    30	<hepta-embed type="card" id="d40b7e72-7a09-4256-a218-376738cb1a16">DV answers 204-257: UVM</hepta-embed>
    31	
    32	## Verification & Test Planning
    33	
    34	<hepta-embed type="card" id="cac60428-55d8-4d0d-afaf-950aa4381ecf">DV answers 258-297: Verification &amp; Test Planning</hepta-embed>
    35	
    36	## Algorithms & Scripting
    37	
    38	<hepta-embed type="card" id="dcb9b070-ea3a-4639-b058-08390d3d717d">DV answers 298-341: Algorithms &amp; Scripting</hepta-embed>
    39	
    40	## Analog & Mixed-Signal
    41	
    42	<hepta-embed type="card" id="fd0269fb-5e80-4221-902f-948df6c75967">DV answers 342-356: Analog &amp; Mixed-Signal</hepta-embed>
    43	
    44	## Emulation & Acceleration
    45	
    46	<hepta-embed type="card" id="5a34f7cc-a809-4801-b7d1-34551c4031cf">DV answers 357-357: Emulation &amp; Acceleration</hepta-embed>
    47	
    48	## Behavioral & Brain Teasers
    49	
    50	<hepta-embed type="card" id="3c781d4c-19cd-4d4b-8ee2-8506afda0ec8">DV answers 358-360: Behavioral &amp; Brain Teasers</hepta-embed>
    51	
    52	## Supplement
    53	
    54	<hepta-embed type="card" id="b091876c-f0c5-4969-994a-3af7ca4fd221">DV answers 361-361: Supplement</hepta-embed>
section "China" [16634618-9000-40e4-b3b5-8b6a596f5833]
  pdfCard "秋招ic崗面經整理" [4a634f16-b51c-4b4b-8ee7-6ac5b07a29e2] fileId: 2daa6903-d7ea-4093-b17e-bb610e7a5122, success, 41 pages
    1	[Page 1]
    2	面经
    3	一、2022年秋招面经整理
    (more)
  pdfCard "路科筆試真題完整版1.5.1" [e5125fac-bf3b-43cb-a515-b6a35d42b20c] fileId: ee5fc218-dab5-4df3-ba5e-c9c5f604f4e3, success, 98 pages
    1	[Page 1]
    2	<image fileId="adba6fd5-1ea7-4c15-80cc-3bbeea038489" sourceObjectId="e5125fac-bf3b-43cb-a515-b6a35d42b20c" sourceObjectType="pdfCard" />
    3	路科芯院
    4	路科验证笔试真题 100 题
    5	大吉大利秋招训练营
    6	<image fileId="507d8471-2309-4b85-8438-864f7b160192" sourceObjectId="e5125fac-bf3b-43cb-a515-b6a35d42b20c" sourceObjectType="pdfCard" />
    7	JULY 12, 2019
    8	路科验证
    9	助秋招一臂之力
    10	[Page 2]
    11	为什么选择路科验证？
    (more)
  pdfCard "驗證題集" [705a095d-6bbe-42b0-88bc-e89a7841687f] fileId: 97b6e4d4-02c8-45e5-971e-492604659fda, success, 16 pages
  pdfCard "部分面試題" [ae1a4c62-64f0-433f-abc9-759375de2484] fileId: 4882c1f2-baa6-444b-90e2-243e8b570b8e, success, 28 pages
section "BQ" [2dbd6b42-50c4-4320-8524-201c11c3eba9]
  card "40+ Behavioral Interview Questions (Tips + Sample Answers) | Big Interview" [e07a42d1-cbeb-4016-9ebd-07f1a2163dbe] 459 lines
    1	# 40+ Behavioral Interview Questions (Tips + Sample Answers) | Big Interview
    2	
    3	[resources](https://resources.biginterview.com/resources)
    4	
    5	Behavioral Interviews
    6	
    7	Published on May 30, 2024
    8	
    9	If you have a job interview coming up, you’re guaranteed to hear behavioral interview questions.
    10	
    11	Behavioral interview questions assess candidates’ behavior and skills in specific situations. You’ve probably heard them a million times without even knowing: “Describe a situation when…” or “Can you recall a time when…”.
    12	
    13	Each question aims to evaluate several skills important for the position you applied for — and the best way to answer and showcase those skills is to use the STAR (Situation–Task–Action–Result) framework.
    14	
    15	In this article, you’ll get:
    16	
    17	- A list of 40 behavioral interview questions
    18	
    19	- Sample answers to the 10 most common behavioral interview questions
    20	
    21	- Tips on how to anticipate any behavioral question (and answer them with ease)
    22	
    23	- What to do when you’ve never experienced a situation they’re asking about
    24	
    (more)
  card "我的BQ总结 · High Frequency Interview Questions and Answers" [1857a35d-da93-427a-b2e6-f278f104b699] 105 lines
    1	# 我的BQ总结 · High Frequency Interview Questions and Answers
    2	
    3	## How to Answer Behavioral Interview Questions Using the STAR Formula
    4	
    5	STAR stands for:
    6	
    7	**Situation – Task – Action - Result**
    8	
    9	1. First, describe a work related Situation or Task that you needed to accomplish, and be concise.
    10	
    11	2. Then describe the Action you took. Don’t tell them what you might do or would do, you need to tell them what you did.
    12	
    13	3. Finally, describe what happened -- the result. What did you accomplish? What did you learn? How much time or money did you save? And most importantly does your result solve the problem you described in step 1.
    14	
    15	---
    16	
    17	1. **Tell me a little bit about yourself.**
    18	   I'm a second-year graduate student studying Computer Science at University of Southern California. I'm experienced with Java. I had a Big Data internship at Chinese Academy and Sciences. I have some project experiences including web development and mobile development.
    19	   I also have many project experiences including Frontend (React, Angular), Backend (PHP, Node.js, Express), Android, React Native and Unity 3D. I'm familiar with many front-end web technologies such as JavaScript, AJAX, HTML, CSS. Besides, I'm experienced with relational databases such as MySQL and non-relational databases such as MongoDB.
    20	
    21	   对公司技术栈的了解: I know that the official website of Roblox is using the popular Front-end framework AngularJS, which is also used in one of my Full Stack project. In addition, my friend who is having an internship at Roblox told me that the backend of Roblox is mainly implemented by .Net. So I’m excited to learn more about your company and the chance to contribute to your web development team with my skills.
    22	
    23	   I love Open Source. I shared my code of 4 projects on GitHub to get feedback from other developers in order to improve code quality and help other developers learn new technologies. My 4 open source projects have gotten many stars and forks, all of which have been starred by over 100 people. I also submitted some issues to the famous Open Source projects such as ESLint which is a fully pluggable tool for identifying and reporting on patterns in JavaScript.
    24	
    25	2. **What do you know about us**
    26	
    27	   Expedia is the world's largest online travel company.
    28	
    29	   WePay is one of the fastest growing private US companies.My skills match well with your job description including Java, JavaScript, AngularJS, Redis and MySQL. So I want to join WePay to make contributions to your product.
    30	
    31	   Roblox is the largest social platform for play that allows people to imagine, create, and play together in immersive 3D worlds. Over 29 million user-generated online games have been produced on the Roblox platform with over 64 million monthly active players. It's awesome. Last year, Roblox was named to the Incorporated. 5000 list of Fastest-Growing Private Companies in America for the second consecutive year which is a great honor and a good proof that Roblox is an innovative company and has huge potential. I think your product is very creative and interesting.
    32	
    33	3. **Why you are interested Roblox?**
    34	   **Roblox:** I very agree with the the engineer culture of Roblox that every engineer is a product manager since our final goal is to make a good product.
    35	   I'm Passionate about games, social networking and community driven content generation.
    36	   I'm also very Interested in working on large scale distributed web application development
    37	   So I want to join your team as a Web Intern in Summer and help you build the world's best user generated gaming platform, supporting integrated desktop and mobile gameplay.
    38	   **Expedia:** First, I like your **product**. My friends and I often use Expedia App for flights, hotels and cars. The service of Expedia is convenient and efficient. So I'm excited about the opportunity to join Expedia to make contributions to the great product.
    39	
    40	   The **culture** of Expedia also attracts me. Expedia is a great company with good work/life balance. Engineers at Expedia know how to have fun. They love solving problems and creating ideas. My friends working at Expedia told me that the team atmosphere is very nice.
    41	
    42	   What's more, Expedia is a big company so I can have the opportunity to touch different projects to broaden my vision.
    43	
    44	4. **Describe your favorite/most proud/most challenging project**
    45	
    46	   My XXX project is a React web application. It's the second project on my resume.
    47	   I implemented a Material UI version of cnodejs.org website, which is the biggest Node.js Chinese community. I applied ReactJS for the Frontend development, which is the most popular Frontend framework. I used Node.js and Express for Backend services development. The difficult/interesting part is that when I wanted to deploy the website on AWS, I found that the generated website JS file was very big up to 900 kilobytes. But I had optimized the generated file according to React official document. To conquer it, I read a lot of source code on GitHub and talk with my friends in the industry and tried for many times（这里透露了三个点：自主学习能力，向合适的的人寻求帮助还有实验精神）. Finally I found the problem which is that I used a third-party react component called "react-simplemde-editor" and its code quality was not good enough. The author of this component used React as the production dependency instead of the development dependency which leads to the big generated JS file. Then I solved the problem by rewriting the component by myself. After this optimization, the generated JS file was reduced by 200 kilobytes. When I seen the website used by thousands of web developers, I was very proud of it.
    48	
    49	   The Angular Web App I developed is a collaborative online judge system which allows multiple users to edit simultaneously. The Frontend frameworks I mainly used are Angular2, Bootstrap and Socket.io. The Backend frameworks are Node.js, Express, Redis and Flask. The Redis is a an open source, in-memory data structure store, used as database, cache and message broker. I used Redis to store the editing session in memory temporarily. I used Docker container to execute user-submitted code on server. In order not to slow down the frontend server (Node.js server), I deployed Docker container on backend server and make it accept execution requests coming from frontend server. In order to make the system scalable and easy to maintain, for each language, I set up an individual Docker image. In this structure, I also used a dispatcher to dispatch execution tasks based on language type. Task Dispatcher can be implemented using Node.js as it is perfect for I/O heavy scenario (which is our case).
    50	
    51	5. **Describe a teamwork experience, your role, team result**
    52	
    53	   During my Big Data internship at Chinese Academy of Sciences, my role was to implemented a parallel Louvain community detection algorithm by using Spark and GraphX with other 2 team members. We need to read many papers about this algorithm. To complete the task with high quality, I had extensive communication with team members and got a lot of useful advice from the mentors. Then we made a lot of optimization on the draft algorithm. For example, we improved time performance by simplifying the Modularity formula. And we enhanced the space performance by replacing the Java native Serializable with the Kryo serialization framework. Finally we successfully improved the algorithm performance by 30%. The improved algorithm could detect 40,000 communities from data of 30 million users in 2 hours.
    54	
    55	   In the original algorithm each vertex examines the communities of its neighbors and makes a chooses a new community based on a function to maximize the calculated change in modularity. In the distributed version all vertices make this choice simultaneously rather than in serial order, updating the graph state after each change. Because choices are made in parallel some choice will be incorrect and will not maximize modularity values, however after repeated iterations community choices become more stable and we get results that closely mirror the serial algorithm.
    56	
    57	6. **Do you have any questions for me?**
    58	
    59	   1.Do you see any room for improvement in my code?
    60	
    61	   2.I have seen your LinkedIn profile before the interview and I know that your current work is to develop tools for enterprise cloud security. So my question is that what are you most proud about in your career so far?
    62	
    63	   3.What are the engineering challenges that your team is facing?
    64	
    65	   4.What qualities do you look out for when hiring for this role?
    66	
    67	Based on my knowledge about React, I developed a React Native App for browsing GitHub trending and popular projects from scratch in only 2 weeks. I have released the App on Google Play to help other GitHub users.
    68	
    69	I’m also a team player. During my internship at Chinese Academy of Sciences, I had extensive communication with and learning from other team members and mentors. Finally we successfully improved the algorithm performance by 30%.
    70	
    71	**Can you share more about the day-to-day responsibilities of this position? What's a typical day like?**
    72	**BTW, How many web interns do you plan to hire?**
    73	
    74	---
    75	
    76	1. Do you played their games or editor
    77	
    78	2. What kind of knowledge do you have.
    79	
    80	3. What role did you take in your previous internship?
    81	
    82	4. What was the best aspect you've learned from this experience?
    83	
    84	5. **What is Your Greatest Weakness?**
    85	   When I first started college, I was a pretty horrible public speaker. I knew this was something I wanted to overcome, so I promised myself to speak up more in small groups. Later, I took it a step further and took a public speaking class. Now, even though it doesn’t come naturally to me, I think I’ve made some big improvements. In fact, I recently presented at a student conference to an audience of over 100.
    86	
    87	6. **Tell Me About a Time You Failed**
    (more)
  pdfCard "How-To-Answer-The-64-Toughest-Interview-Questions" [da686434-7b6f-4f26-b41e-b8e4bb3f297b] fileId: 4abd8b3f-a43f-42e9-a449-1808ea5c14ce, success, 41 pages
    1	[Page 1]
    2	How to Answer The 64 Toughest Interview Questions
    3	[Page 2]
    4	THIS BOOK IS DESIGNED TO PROVIDE ACCURATE INFORMATION ON THE SUBJECTS COVERED. HOWEVER, IT IS DONE WITH THE UNDERSTANDING THAT THE PUBLISHER IS NOT ENGAGED IN RENDERING LEGAL, ACCOUNTING OR PROFESSIONAL SERVICES. IF LEGAL ADVICE OR OTHER PROFESSIONAL ASSSTANCE IS REQUIRED, THE SERVICES OF A COMPETENT, PROFESSIONAL PERSON SHOUID BE SOUGHT. ANY NAMES USED IN THE TEXT ARE FICTITIOUS AND FOR ILLUSTRATIVE PURPOSES ONLY. ANY RESEMBLANCE TO ACTUAL PERSONS OR COMPANIES IS PURELY COINCIDENTAL AND UNINTENTIONAL.
    5	[Page 3]
    6	Dedication:
    7	This report is dedicated to courage and knowledge, the two qualities most needed to succeed in any human challenge, especially a job search.
    8	[Page 4]
    9	Table of Contents
    (more)
  card "BQ 行为面试 behavior question 答案sample|amazonPM面经|一亩三分地数科面经版" [111112f8-494e-4728-9dd8-531c6549f18a] 426 lines
    1	# BQ 行为面试 behavior question 答案sample|amazonPM面经|一亩三分地数科面经版
    2	
    3	## 1.Tell me about yourself.
    4	
    5	What the hiring manager really wants is a quick, two- to three-minute snapshot of who you are
    6	and why you’ re the best candidate for this position.
    7	So as you answer this question, talk about what you’ ve done to prepare yourself to be the very
    8	best candidate for the position. Use an example or two to back it up. Then ask if they would like
    9	more details. If they do, keep giving them example after example of your background and
    10	experience. Always point back to an example when you have the opportunity.
    11	“ Tell me about yourself” does not mean tell me everything. Just tell me what makes you the
    12	best.
    13	
    14	### sample answer:
    15	
    16	I have been working in the field of civil engineering for the past 6 years. My most recent. ----
    (more)
  card "問BQ(behavioral question)時，他們到底在問什麼|一畝三分地求職（非面經）版" [9808dc95-cf35-4f62-baef-186edcaad7bb] 58 lines
    1	# 問BQ(behavioral question)時，他們到底在問什麼|一畝三分地求職（非面經）版
    2	
    3	2019(10-12月)-**ME**碩士+短暫實習或全職不超過3個月 | 網上海投| **碼農類General全職**@**MathWorks**
    4	
    5	*本帖最後由 大隊管理員 於 2019-11-3 02:27 編輯 *
    6	
    7	---
    8	
    9	歷時2個多月的刷題和無數拒信後，樓主終於轉專業上岸了，寫一些關於BQ的經驗回報地裡吧。關於我認為的BQ問題的潛台詞，我給您翻譯翻譯，這些BQ到底在問什麼？現在BQ越來越重要了，我碰到兩次面試，有一輪就是只問BQ，連續40分鐘BQ快問快答，人都要瘋掉了，說得口乾舌燥。這裡寫一些常見的BQ吧，基本屬於必考感覺。
    10	
    11	- 介紹一個你最喜歡的項目？介紹下簡歷？介紹下自己？
    12	
    13	  > 有沒有看職位要求？說說職位要求要找什麼人？你是這樣的人麼？介紹一個你最符合這個職位要求的項目，最後強調你是good fit。
    14	
    15	- 你最大的缺點/失敗？
    16	
    17	  > 你一個無傷大雅的小缺點/失敗是什麼？你從以前的哪個項目知道自己有這個缺點/失敗？知道以後學到了什麼教訓？在後面哪個項目中吸取了這個教訓，做了什麼，取得了什麼結果？
    18	
    19	- 你最大的優點？
    20	
    21	  > 我知道你很牛，你哪個特質最符合這個職位的要求，並且在最後強調你的某某優點讓你是一個good fit for this position。
    22	
    23	- 為什麼選我們這個公司？
    24	
    25	  > 公司的mission是什麼？我的career goal和你們公司的mission完美契合；職位的要求是什麼？我的背景和能力和這個職位的要求完美契合。最後強調你是good fit。
    26	
    27	- 怎麼知道這個職位的？
    28	
    29	  > 如實回答就行，我一般都說career fair和公司的工程師聊了聊，關鍵是最後要再重複一遍，據我瞭解，這個職位是幹啥或者需要啥，我以前也在做這個或者有相關的技能，所以good fit。
    30	
    31	- 隊友/同事不幹活/很難相處咋辦？
    32	
    33	  > 你有沒有經常和隊友/同事主動溝通？你願不願意為了團隊，幫隊友/同事分擔一些工作？能不能以非常職業的方式解決這個問題？
    34	
    35	- 隊友/同事不同意你的觀點咋辦？
    36	
    37	  > 你有沒有自己花一些時間做一個量化（quantitative）的比較？有沒有向隊友/同事提交一個詳細的報告或者比較（report/strong case）來說服ta？會不會有效的溝通？
    38	
    39	- 你怎麼定義成功？
    40	
    41	  > 一般我都說達到自己制定的目標就算成功，這樣容易說；那就可以理解為你有沒有為自己制定目標？你的目標是啥？你現在完成的怎麼樣？未來在這個公司想怎麼發展自己？（develop tech stack，gain more domain knowledge，see myself in postion of senior engiener in xx years）
    42	
    43	- 被安排了一個很難的任務咋辦？
    44	
    45	  > 你會不會和你的老闆溝通？你會不會和你的同事溝通？你會不會提出合理的要求？能不能以非常職業的方式解決這個問題？
    46	
    47	- 任務的due被提前了咋辦？有沒有身背數個deadline的經歷？
    48	
    49	  > 你是怎麼管理你的時間的？比如日曆上設定好項目，還有提醒；你會不會根據工作的優先順序安排你的時間？你會不會為了項目組的整體利益考慮（best interest of my team），捨棄一些個人利益？比如為了畢設，自己的考試就不投入太多時間；會不會和別人溝通尋找解決方案？如果你是組長，你知道due提前了會不會採取措施？比如立刻開會，重新安排這個項目後面的任務和時間節點。
    50	
    51	- 為什麼你是xx專業，卻想做sde/ds/mle？
    52	
    53	  > 你之前哪段項目/實習經歷做了有關sde/ds/mle的啥？你產生了啥影響，取得了啥結果？你是不是很享受你的產出？（是，所以我想轉）
    54	
    55	
    56	祝大家秋招順利！
    57	
    58	
  card "Crack the Behavior Questions——关于Behavior Question的碎碎念|码农公司s求职讨论|一亩三分地求职（非面经）版" [a925ecaf-ac04-4664-859d-372c2f3a3d4f] 122 lines
    1	# Crack the Behavior Questions——关于Behavior Question的碎碎念|码农公司s求职讨论|一亩三分地求职（非面经）版
    2	
    3	*本帖最后由 Emmon1990 于 2014-10-11 15:27 编辑 *
    4	
    5	撒花激动一下家属顺利跳槽\~！回馈大众来写一篇Behavior Question攻略\~
    6	
    (more)
  card "一些準備BQ (behavioral questions)的資源,附samples|ubs求職討論|一畝三分地求職（非面經）版" [f1ab1bea-447f-49d9-aafd-75437d7f7631] 154 lines
    1	# 一些準備BQ (behavioral questions)的資源,附samples|ubs求職討論|一畝三分地求職（非面經）版
    2	
    3	經歷3個月的掙扎，職場小白最近剛剛跳槽成功，總結了一些有助於準備BQ的資源。我自己準備BQ的思路一般是-仔細讀JD，總結出來職位要求的soft skills (communication,...
    4	
    5	經歷3個月的掙扎，職場小白最近剛剛跳槽成功，總結了一些有助於準備BQ的資源。
    6	
    7	## 我自己準備BQ的思路一般是
    8	
    (more)
section "Textbook" [5e8d61f6-6e63-4210-b0eb-70472a3aa182]
  pdfCard "IEEE_1800-2012_SystemVerilog" [c8f1f602-790b-4393-bd86-99ec3d85c0a5] fileId: 812520e7-b6f2-48f9-988d-f5347490dc50, success, 1315 pages
    1	[Page 1]
    2	IEEE Standard for SystemVerilog— Unified Hardware Design, Specification, and Verification Language
    3	IEEE Computer Society   
    4	and the   
    5	IEEE Standards Association Corporate Advisory Group
    6	Sponsored by the Design Automation Standards Committee
    7	IEEE   
    8	3 Park Avenue   
    9	New York, NY 10016-5997   
    10	USA
    11	IEEE Std 1800™-2012 (Revision of IEEE Std 1800-2009)
    12	21 February 2013
    13	[Page 3]
    14	IEEE Standard for SystemVerilog— Unified Hardware Design, Specification, and Verification Language
    15	Sponsor
    16	Design Automation Standards Committee
    17	of the
    18	IEEE Computer Society
    19	and the
    20	IEEE Standards Association Corporate Advisory Group
    21	Approved 5 December 2012
    22	IEEE-SA Standards Board
    23	[Page 4]
    (more)
  pdfCard "Cracking Digital VLSI Verification Interview Interview Success (Ramdas Mozhikunnath, Robin Garg) (z-library.sk, 1lib.sk, z-lib.sk)" [0f54ab20-aa60-4513-b2a7-9a4ea72627a2] fileId: b097cc12-bc97-4518-aeed-db99c626a056, success, 302 pages
    1	[Page 1]
    2	Cracking Digital VLSl Verification Interview
    3	Verification Methodologies
    4	Digital Logic
    5	Programming
    6	Computer Architecture
    7	Verification Fundamentals
    8	Behavioral
    9	Version Control
    10	500+ Questions with Solutions
    11	Let's Decode
    12	[Page 2]
    13	Cracking Digital VLSI Verification Interview Interview Success by Ramdas Mozhikunnath & Robin Garg
    14	First Edition: March 2016
    15	Disclaimer
    16	Every effort has been made to make this book as complete and as accurate as possible, but no warranty is implied. The authors shall have neither the liability nor the responsibility to any person or entity with respect to any loss or damages arising from the information contained in this book or other resources accompanying this book.
    17	This book is an independent work of the authors and is not endorsed by their employers.
    18	Foreword
    (more)
section "1point3acres" [8249009a-3755-4a6f-9fa4-7dd02423922d]
  card "ASIC Design / Verification 面試經驗總結（一畝三分地，2015）" [5fc32579-59d7-45a3-a731-6b9ea620698b] 106 lines
    1	# ASIC Design / Verification 面試經驗總結（一畝三分地，2015）
    2	
    3	**來源：** [一畝三分地 thread 132320](https://www.1point3acres.com/bbs/thread-132320-1-1.html) · 經由 [鏡像頁面](http://520193.xyz/Discuz/1point3acres/thread-d846dcb-1-1.html) + 第 2–3 頁 PDF 剪輯
    4	**作者：** lwy1992417 · **發文：** 2015-04-22 · **標籤：** ASIC verification、Apple、NVIDIA、Qualcomm、Cadence、Oracle、Mentor、Cirrus Logic
    5	**職位：** 全職、應屆畢業（校園招聘 + 電面 + onsite）· **結果：** 拿到 offer
    6	**背景：** 專排前 30 學校的 EE 碩士，主修 ASIC Verification，GPA 4.0；作者自認屬平均水準。投了約 20 家，8–9 家給面試。
    7	
    8	> 此剪輯為原文的摘要改寫。討論串中的個人聯絡方式刻意不收錄。
    9	
    10	---
    11	
    12	## 需要準備的方向
    13	
    14	1. **RTL design**：gate-level design、Verilog coding
    15	
    16	2. **Verification methodology**：constrained-random、SystemVerilog
    17	
    18	3. **Computer architecture**
    19	
    20	   - Cache：實作、policy、coherence protocol
    21	
    22	   - CPU pipeline：ROB、OoO、exception handling、register renaming
    23	
    24	   - Branch prediction / speculation
    25	
    26	   - Hazard：control、data、structural；memory hazard
    27	
    28	4. **Low power**：multi-Vth、clock gating、multi-VDD / power gating、DVFS（跨頻率域問題）
    29	
    30	5. **Coding**：Perl/Python（regular expression）、C++、SV、Verilog、Unix
    31	
    32	6. **工具**：模擬（ModelSim）、合成（Synopsys DC）、schematic / layout（Cadence Virtuoso）
    33	
    34	---
    35	
    36	## 各公司面試內容
    37	
    38	### NVIDIA：C++ Verification 職位
    39	
    40	- 電面和 onsite 全都是 coding
    41	
    42	- C++；SV（pass by reference）；腳本（regular expression）；design（sequence detector）
    43	
    44	### Apple：難度最高；onsite 8 輪，全部通過才給 offer
    45	
    46	- **Cupertino CPU 組：** computer architecture（MOESI）、C、verification methodology
    47	
    48	- **Cupertino SoC 組：** constrained-random methodology；I-cache 與 D-cache miss 在 in-order 五級 pipeline 和 OoO Tomasulo pipeline 中的行為差異；跨時脈域
    49	
    50	- **Austin GPU 組：** 多型、cache 實作、verification methodology
    51	
    52	- **Onsite（Cupertino）：** cache coherence；用 speculation 處理 control dependency（預測錯了怎麼辦）；C++ debugging；多型；Perl；DV methodology；low power（isolation cell）；跨頻率域；load/store 及相關結構；FIFO 設計 + coding；基本設計題（用 MUX 實作 XOR）
    53	
    54	### Qualcomm：onsite 後被告知沒有預算給 offer
    55	
    56	- **電面：** branch predictor；latch vs register；LRU vs LFU；不同 pipeline 中的 data hazard；8-entry table 設計
    57	
    58	- **Onsite：** memory verification；Perl；coverage-driven constrained-random methodology；adder 設計與進階問題；branch predictor；low power；virtual address mapping；從一段 assembly code 找出 hazard；用 Verilog 寫出從 8-entry resource 回傳可用 entry 的邏輯
    59	
    60	### Mentor Graphics（EDA 公司）
    61	
    62	- **電面：** coverage-driven、assertion-based、constrained-random verification methodology；履歷相關
    63	
    64	- 因時程衝突婉拒 onsite；職位是 rotation engineer
    65	
    66	### Oracle
    67	
    68	- **電面：** 著重在作者做過的 verification project；基本設計題與優化方法
    69	
    70	- **Onsite：** 範圍非常廣，偏重團隊本身的工作而非職位要求：firmware、DV、合成、面積與 latency 優化、low power、co-simulation，還有很多 RTL 設計與合成工具（Synopsys DC）內部機制的實務問題
    71	
    72	### C1：Cirrus Logic（Austin），偏 DSP
    73	
    74	- **電面：** 8-bit counter 設計；驗證 2-bit counter；跨時脈域的問題與解法；assertion；timing constraint
    75	
    76	### C2：Cadence，Design 職位（面試官全是 principal engineer / director，非常難）
    77	
    78	- **電面：** Verilog 實作 MUX 的 4 種方法；blocking vs non-blocking；sequential vs combinational；coverage-driven constrained-random；FSM；合成；low power；跨時脈域
    79	
    80	- **Onsite：** 跨時脈域 FIFO 設計；處理不可靠資料傳輸的 handshake 電路；physical design、P&R；low power；困難的 sequence detector（每個 cycle 輸入 4 bit，含 corner case）；根據 timing diagram 驗證系統行為；SVA
    81	
    82	---
    83	
    84	## 回覆中的問答（第 1–3 頁）
    85	
    86	- **面試內容比例：** coding 只占一小部分，大部分是觀念與 high-level 設計。
    87	
    88	- **準備用網站：** [asic-world.com](http://www.asic-world.com)、[only-vlsi.blogspot.com](http://only-vlsi.blogspot.com)、[testbench.in](http://www.testbench.in)
    89	
    90	- **作者投遞的公司清單：** Analog Devices、Apple、Cirrus Logic、Cisco、IBM、Intel、NVIDIA、Broadcom、Synopsys、Microsoft、Altera、Mentor Graphics、Qualcomm、Cadence、Oracle、Western Digital、Marvell、Ericsson、AMD、SanDisk、Google、Juniper、Seagate、LSI、Xilinx、ARM、Freescale、TI
    91	
    92	- **怎麼找公司：** 在 LinkedIn 搜尋職位關鍵字，多和同學、學長姐交流。大部分是網投，4–5 家是內推。
    93	
    94	- **職位類型：**
    95	
    96	  - 前端：logic design / verification
    97	
    98	  - 後端：physical design、P&R
    99	
    100	  - 架構：cache design、CPU verification
    101	
    102	- **UVM/OVM：** 懂 methodology 會加分，但有些組用 VMM 等其他 methodology。最好懂一點 C++，SV 常用的 callback 和 C++ 的多型很像。
    103	
    104	- **Verification 用 SV 還是 C++ 多：** 看公司。
    105	
    106	*本討論串共 4 頁，此剪輯涵蓋第 1–3 頁（第 4 頁未剪輯）。*
  card "USC VLSI DV方向 學習/找工作經驗小結｜一畝三分地院系介紹版" [0783f939-7911-4650-b908-ba390055e068] 102 lines
    1	# USC VLSI DV方向 學習/找工作經驗小結｜一畝三分地院系介紹版
    2	
    3	最近剛剛結束找工作，想起自己在master的第一學期為了GPA不得不drop課的時候，還是有些感慨。在美國的兩年得到了很多學長學姐的幫助，也在地裡看到了很多有用的帖子，受益 ...
    4	
    5	* 本帖最後由 Gyro.yu 於 2021-2-28 15:47 編輯 *
    6	
    (more)
  card "NVIDIA Hardware Design Verification 面經（一畝三分地，2020）" [71a05b8f-81ed-45e3-bb16-b9ff9de719c3] 87 lines
    1	# NVIDIA Hardware Design Verification 面經（一畝三分地，2020）
    2	
    3	**來源：** [一畝三分地 thread 666739](https://www.1point3acres.com/bbs/thread-666739-1-1.html) · 經由 [鏡像頁面](http://520193.xyz/Discuz/1point3acres/thread-42eac65-1-1.html) 剪輯
    4	**作者：** 匿名 · **發文：** 2020-09-07 · **標籤：** NVIDIA、DV、SoC、GPU、onsite
    5	**職位：** 全職 Hardware Design Verification（碩士，約 10 個月工作經驗）· **結果：** 拿到 SoC 組（Austin）offer
    6	
    7	> 此剪輯為原文的摘要改寫。
    8	
    9	## 總覽
    10	
    11	- 難度偏向 new grad 而非 senior。考點：UVM、SV、Verilog、C++、CPU architecture、GPU architecture。
    12	
    13	- 面了 **SoC** 和 **GPU** 兩組。最後接了 SoC 的 offer；GPU 只面了第一輪電面。
    14	
    15	- **電面才是真正的篩選關卡**（兩輪：一輪是當地的 manager / 工程師，一輪是外地的，可以安排在同一天）。過了電面之後，onsite 比較像在聊 team fit。
    16	
    17	- 電面會用白板 coding，也有很多「這個 DUT 要怎麼驗」的問題：testbench、corner case、coverage。
    18	
    19	---
    20	
    21	## SoC 電面第一輪（觀念 + coding 混合）
    22	
    23	1. **為什麼用 UVM？UVM 怎麼做到 reuse？** → factory、SV 的多型 / 繼承、parameterized class
    24	
    25	2. **什麼是 functional coverage？**
    26	
    27	3. **怎麼驗證 sync FIFO？** → 用哪些 UVM component、scoreboard、coverage、testcase、corner case（作者事先準備過這題）
    28	
    29	4. **怎麼驗證 serializer？** 輸入 8-bit `A, B, C`；輸出 1-bit `done`、1-bit `out`
    30	
    31	   - 在白板上用 SV 寫 scoreboard 的比對（expected vs actual），再談 coverage 和 testcase
    32	
    33	   - corner case 很多：連續的 sequence、bubble；scoreboard 比較 tricky
    34	
    35	## SoC 電面第二輪（全部 coding，約 1 小時，2 題）
    36	
    37	1. **OOP 繼承與多型**：給一段 code，判斷 virtual function override 的行為；寫一個展示多型、向上 / 向下轉型的例子，並說明實際工作中的使用情境
    38	
    39	2. **Protocol converter DUT：burst R/W → single R/W**：建 scoreboard + reference model
    40	
    41	   - 面試官打斷 testbench 的整體介紹，直接要求寫 scoreboard
    42	
    43	   - 如果不熟 SoC 常用的 bus protocol 會很吃力；作者沒寫完，但還是過了
    44	
    45	## SoC Onsite（Austin）
    46	
    47	這組負責 SoC 上的 system block，有大量 legacy testbench（用 Perl 產生 stimulus，再用 Verilog 驅動 RTL），正在往 UVM 遷移。會問很多寫腳本的題目。
    48	
    49	1. **Digital root DUT**：輸入 unsigned integer，DUT 反覆把十進位各位數相加，直到結果 < 10（例如 12345 → 15 → 6）。要怎麼驗？scoreboard、corner case、coverpoint。
    50	
    51	2. **找出 monitor 程式碼的 bug**
    52	
    53	   - interrupt 比 write function 早到，所以 write 永遠不會被中斷（邏輯錯誤）
    54	
    55	   - 沒用 `automatic` 變數 → 不同的 function call 會互相干擾
    56	
    57	3. **Perl：從 regression log 中 grep error signature**，存進關聯陣列（map：signature → count）
    58	
    59	4. **職涯中遇過最難的 bug**（behavioral，要事先準備故事）
    60	
    61	5. **Perl：把 module→instance 的表反轉成 instance→module(s)**
    62	
    63	   - 輸入：`GA1: AB, CD` / `GB1: CD, EF`
    64	
    65	   - 輸出：`AB: GA1` / `CD: GA1, GB1` / `EF: GB1`
    66	
    67	6. **Pulse train 的 checker**：輸入一個 start pulse；輸出多個 pulse，間隔逐漸增加（3、4、5…250 個 cycle），之後再回到 3。寫 checker（計算 rising edge 之間的 cycle 數），並處理中途 reset、序列中途又來 start 等情況。
    68	
    69	7. **移除陣列中的重複元素**：SV 有 `unique()` 可以直接用；如果面試官不允許，就要自己寫
    70	
    71	## GPU 電面第一輪
    72	
    73	1. **Fibonacci**：遞迴 + 迭代、複雜度
    74	
    75	2. **Sequence detector FSM**：Moore vs Mealy、overlapping vs non-overlapping
    76	
    77	3. **Computer architecture**：pipeline stages、pipeline hazards
    78	
    79	---
    80	
    81	## 回覆中的補充
    82	
    83	- UVM RAL / register model 很少被問（作者準備了很多 RAL，結果都沒用到）
    84	
    85	- onsite 後 HR 回覆很快（約一週）
    86	
    87	*本討論串共 2 頁，此剪輯涵蓋第 1 頁。*
  card "NVIDIA Design Verification (GPU) 面經（一畝三分地，2024）" [a49c29fe-94cb-401f-9a96-e4a7cd784f36] 67 lines
    1	# NVIDIA Design Verification (GPU) 面經（一畝三分地，2024）
    2	
    3	**來源：** [一畝三分地 thread 1053788](https://www.1point3acres.com/bbs/thread-1053788-1-1.html) · 經由 [鏡像頁面](http://520193.xyz/Discuz/1point3acres/thread-db3a868-1-1.html) 剪輯
    4	**作者：** Lv17 · **發文：** 2024-03-18 · **標籤：** NVIDIA、DV、GPU、電面
    5	**職位：** 全職 DV（碩士），2024 年 1–3 月面試 · **結果：** Waitlist（之後被告知沒有 headcount）
    6	**背景：** 目前在 start-up 工作，經歷涵蓋 RTL sim → gate sim、UVM → SoC level、PHY IP。
    7	
    8	> 註：鏡像頁面上的中文有部分亂碼，此剪輯只保留能清楚辨識的內容，並以摘要方式改寫。
    9	
    10	---
    11	
    12	## 第一輪：只問觀念，沒有 coding（也沒有自我介紹）
    13	
    14	1. Blocking vs non-blocking assignment
    15	
    16	2. 在 log file 裡搜尋關鍵字並取代（腳本）
    17	
    18	3. 偵測 `1101` 的 sequence detector FSM：畫出狀態機，在最後一個 `1` 時輸出拉高
    19	
    20	4. Fibonacci：說明遞迴寫法
    21	
    22	5. DUT 的 test plan：functional tests、不同頻率測試、reset tests、corner case 與 error case
    23	
    24	等了約兩週才進第二輪。
    25	
    26	## 第二輪：live coding（沒有自我介紹）
    27	
    28	1. 反轉 linked list
    29	
    30	2. **陣列中最長的 peak**：回傳是否有 peak，以及最長 peak 的長度
    31	
    32	   - `[1, 1, 2, 3, 2, 2]` → 有 peak，長度 4（`1,2,3,2`）
    33	
    34	   - `[2, 2, 2, 2, 2, 2]` → 沒有 peak
    35	
    36	   - `[1, 3, 1, 2, 4, 6, 5]` → 有 peak，長度 5（`1,2,4,6,5`）
    37	
    38	3. **Parity flag 電路**：encoder 輸出 2-bit code（X、Y、W、Z）。當 X 出現偶數次 **且** W 出現奇數次時，`Flag = 1`。用最少的 gate（AND / OR / XOR / MUX）畫出電路。
    39	
    40	作者心得：沒有刷 LeetCode，第 2 題花了約 15 分鐘，for loop 部分需要面試官提示。第 3 題想到用 1-bit counter，但當下沒想到 1-bit 的奇偶計數其實就是 XOR（T flip-flop）toggle。
    41	
    42	### 回覆中對第 3 題的討論
    43	
    44	- 有回覆指出 flag 就是 `~X_par & W_par`。
    45	
    46	- 作者同意：每個符號用一個 1-bit toggle 就夠了，不需要完整的 counter，因為只在乎 count mod 2。
    47	
    48	```verilog
    49	// parity trackers: toggle on each occurrence
    50	always_ff @(posedge clk or negedge rst_n)
    51	  if (!rst_n) begin x_odd <= 1'b0; w_odd <= 1'b0; end
    52	  else begin
    53	    x_odd <= x_odd ^ (code == X);
    54	    w_odd <= w_odd ^ (code == W);
    55	  end
    56	assign flag = ~x_odd & w_odd;   // X even AND W odd
    57	```
    58	
    59	---
    60	
    61	## 討論串中的其他資訊
    62	
    63	- DV 的 coding 語言：C/C++（有人問能不能用 Python，作者表示 DV 指定 C/C++）
    64	
    65	- 有讀者對 encoder 題目的敘述（2-bit 輸出 vs 4 個符號）有疑問，原題敘述本身有些模糊。
    66	
    67	*本討論串共 2 頁，此剪輯涵蓋第 1 頁。*
  card "Preparing ASIC Design Verification Interview (1point3acres)" [4773e324-bdee-47ee-9c0e-42ec68816086] 187 lines
    1	# Preparing ASIC Design Verification Interview (1point3acres)
    2	
    3	**Source:** [1point3acres thread 431605](https://www.1point3acres.com/bbs/thread-431605-1-1.html) · clipped via [mirror](http://520193.xyz/Discuz/1point3acres/thread-0aaba97-1-1.html)
    4	**Author:** lapore · **Posted:** 2018-06-26 · **Tags:** DV interview, SystemVerilog, UVM, digital logic
    5	**Context:** Author did 6 DV onsites and got offers from all 6. Written for new grads / engineers with a few years' experience. Clip is a paraphrased study outline, not a verbatim copy.
    6	
    7	---
    8	
    9	## 1. SystemVerilog (read the LRM, hand-write examples — whiteboard coding is common)
    10	
    11	### Simulation semantics
    12	
    13	- Event scheduling regions (Active / Inactive / NBA, etc.) — e.g. what `$display` prints right after a blocking update feeding a continuous `assign`
    14	
    15	- Inter- vs intra-statement delay: `#5 a = b;` vs `a = #5 b;` vs `a = @(posedge clk) b;` vs `a = repeat(5) @(posedge clk) b;`
    16	
    17	### Data types
    18	
    19	- 4-state types: `logic` / `reg` / `integer` / `time`
    20	
    21	- 2-state types: `bit` / `int`
    22	
    23	- `enum` — how do you `typedef enum`?
    24	
    25	- `struct` — how do you `typedef struct`? What's a packed vs unpacked structure?
    26	
    27	- Type casting: static (`type'(...)`) vs dynamic (`$cast`)
    28	
    29	- Packed array vs unpacked array — what's each, and what's the difference?
    30	
    31	- Dynamic array: `new[]`, `size()`, `delete()`
    32	
    33	- Queue: bounded queues (`[$:N]`), slicing, `size()`, `delete(index)`, `pop_front()`, `push_front()`, `pop_back()`, `push_back()`
    34	
    35	- Associative array: `num()`, `size()`, `delete(index)`, `exists(index)`, `first()` / `last()` / `next()` / `prev()`
    36	
    37	- Given an associative array of queues, how do you pass it as a function argument? → declare a `typedef` for the type
    38	
    39	- Array locator methods: `find`, `find_index`, `find_first`, `find_first_with`, `find_last`, `find_last_with`
    40	
    41	- Array reduction methods: `sum()`, `product()`, `and()`, `or()`, `xor()`
    42	
    43	  - Gotcha: `sum() with (item >= 2)` on a 1-bit result gives 0/1 unless you cast with `int'(...)`
    44	
    45	### Classes / OOP
    46	
    47	- Implicit `super.new()`; polymorphism and how virtual dispatch works (vtable)
    48	
    49	- `static task` vs `task static`; task vs function
    50	
    51	- `local` / `protected`; pure virtual classes and methods
    52	
    53	- Scope resolution `::`; parameterized classes (use typedefs)
    54	
    55	- Pass handle by value vs by reference (`ref` lets you reassign the handle itself)
    56	
    57	### Processes
    58	
    59	- `initial` / `always` / `final`; clock generation with `forever #(T/2) clk = ~clk;`
    60	
    61	- Static vs automatic variables:
    62	
    63	  - `fork…join_none` inside a `for` loop needs an `automatic` copy of the loop var
    64	
    65	  - Non-automatic task args are shared across concurrent calls → declare `task automatic`
    66	
    67	- `fork` / `join` / `join_any` / `join_none`, `disable fork`, `wait fork`
    68	
    69	- `process::self()` → `await / status / kill / suspend / resume`
    70	
    71	- `foreach` with skipped dimensions (`foreach (A[i,,k])`)
    72	
    73	### Verification constructs
    74	
    75	- **Clocking blocks** (sampling/driving, input/output skew) — often misunderstood
    76	
    77	- **Interfaces** and why virtual interfaces exist
    78	
    79	- Semaphores, mailboxes, events
    80	
    81	- **Assertions** (SVA) — Doulos tutorials are enough for interviews
    82	
    83	- **Functional coverage**
    84	
    85	- **DPI**: import/export, building the shared lib, scope issues
    86	
    87	### Constraints ⭐ (asked at nearly every onsite)
    88	
    89	- One-hot without functions: `a != 0; (a & (a-1)) == 0;` (one-cold: same on `~a`)
    90	
    91	- Unique array elements without `unique`: nested `foreach` with `i < j → a[i] != a[j]`
    92	
    93	- 8-queens constraint on `board[8][8]`
    94	
    95	- Constrain dynamic array size; strictly increasing array
    96	
    97	- `rand` vs `randc`; implement `randc` manually
    98	
    99	- `solve…before` (why it's needed), `dist` with `:=` vs `:/`, `inside`
    100	
    101	---
    102	
    103	## 2. UVM (UVM Cookbook is sufficient; class reference optional)
    104	
    105	- TLM1 ports / exports / imps (imp = implementation in this component; export = forwarded from a child). TLM2 never asked.
    106	
    107	- Sequence items, driver, sequencer, monitor, scoreboard, agent, sequences
    108	
    109	- Reactive sequences: `put_response` / `get_response`, `set_id_info` to route rsp
    110	
    111	- All phases: which are tasks vs functions; top-down vs bottom-up
    112	
    113	- `uvm_config_db` vs `uvm_resource_db`; passing a virtual interface via config\_db
    114	
    115	- Factory: why (type override without touching base code)
    116	
    117	- Virtual sequence / sequencer; sequence layering (translation sequences)
    118	
    119	---
    120	
    121	## 3. Digital Logic / Design
    122	
    123	- Boolean algebra, De Morgan, K-maps
    124	
    125	- Adders (half/full, ripple carry), comparators, count 1s in 7 bits with full adders
    126	
    127	- Build gates from MUX, NAND-only, NOR-only (XOR from 4 NANDs, XNOR from 4 NORs), tri-state + NOT
    128	
    129	- FSMs: Mealy vs Moore, state reduction
    130	
    131	- Sequence detectors (overlap / non-overlap) via FSM **and** shift register — practice `101, 110, 1001, 1011, 1010, 1101, 10010, 101X1, 10XX1`
    132	
    133	- Serial divisible-by-5 FSM (MSB-first vs LSB-first)
    134	
    135	- Setup/hold origins and fixes; metastability
    136	
    137	- Clock dividers: ÷2, ÷3, ÷5 with 50% duty cycle
    138	
    139	- 2-FF synchronizer, toggle synchronizer
    140	
    141	- Sync FIFO; async FIFO with Gray code (Cummings paper)
    142	
    143	- Fixed-priority & round-robin arbiters (kill chain) — and how to verify them
    144	
    145	- CAM design; hardware linked list; "ASIC interview puzzles"
    146	
    147	### Arbiter idea (kill chain)
    148	
    149	- **Fixed priority:** walk bits from highest priority; `grant[i] = req[i] & ~kill[i]`, `kill[i+1] = kill[i] | grant[i]`, with `kill[0] = 0`.
    150	
    151	- **Variable priority:** duplicate `reqs` to 2N bits, the one-hot priority bit restarts the chain, then OR the two halves of the grant.
    152	
    153	- **Round robin:** variable-priority arbiter + a priority register that rotates the last grant left by 1 whenever any grant fires.
    154	
    155	- ⚠️ The code posted in the thread has typos (`req` vs `reqs`, missing width on `grants_int`, unbalanced paren) — rewrite rather than copy.
    156	
    157	```verilog
    158	module fixed_prio_arb #(parameter N = 4) (
    159	  input  logic [N-1:0] req,
    160	  output logic [N-1:0] gnt
    161	);
    162	  logic [N:0] kill;
    163	  assign kill[0] = 1'b0;
    164	  for (genvar i = 0; i < N; i++) begin : g_chain
    165	    assign gnt[i]    = req[i] & ~kill[i];
    166	    assign kill[i+1] = kill[i] | gnt[i];
    167	  end
    168	endmodule
    169	```
    170	
    171	---
    172	
    173	## 4. Coding questions mentioned
    174	
    175	- Swap two vars without temp (XOR trick; add/sub can overflow)
    176	
    177	- Reverse linked list (iterative + recursive); detect cycle
    178	
    179	- Fibonacci (iterative + recursive)
    180	
    181	- Integer palindrome; reverse bits
    182	
    183	- Author's LeetCode focus: linked list, arrays, hash table, bit manipulation, two pointers, binary search, simple DP, simple DFS/BFS
    184	
    185	- Problem list: 1, 3, 5, 7, 9, 15–23, 26, 27, 33, 35, 39, 40, 46, 48, 49, 53, 55, 62, 64, 69, 70, 78, 80, 82, 83, 88–90, 136, 137, 141, 142, 148, 155, 160, 162, 167, 169, 189–191, 203, 206, 215, 225, 229, 231, 232, 234, 237, 242, 260, 268, 278, 287, 301, 326, 342, 374, 384, 693
    186	
    187	
section "Linkedin" [8e71b7f4-c838-4d8a-a85e-5ee6b22199bd]
  pdfCard "Advanced_Protocol_Interview_Handbook" [6a2070b9-0626-49b9-bbad-0a42c7f59812] fileId: 1f5c3ce2-aaf0-40c7-9107-b6363b235760, failed, 0 pages
  pdfCard "fifo-depth-calculation-mad-eeasy" [6c88af77-a82c-47e8-a087-307db68e477e] fileId: ae730b83-a021-4f5e-bc31-4fb90324c613, success, 8 pages
    1	[Page 1]
    2	CALCULATION OF FIFO DEPTH - MADE EASY
    3	Compiled by
    4	Putta Satish
    5	[Page 2]
    6	FIFO DEPTH CALCULATION - MADE EASY
    7	We need to employ an asynchronous FIFO between two modules working at different clock domains when some amount of data has to be transmitted from one module to the other to avoid the data loss. FIFO is required, only when you are slow at reading and fast in writing to buffer the data which is not read by the slower module.
    8	The depth (size) of the FIFO should be in such a way that, the FIFO can store all the data which is not read by the slower module. FIFO will only work if the data comes in bursts; you can't have continuous data in and out. If there is a continuous flow of data, then the size of the FIFO required should be infinite. You need to know the burst rate, burst size, frequencies, etc. to determine the appropriate size of FIFO.
    (more)
  pdfCard "100 Advanced Verilog & SystemVerilog Interview Questions" [e49948af-2308-4780-8f36-fcd31fb6b4f4] fileId: 5dc5c141-8a1e-4f4c-8597-6f5881aeb0fa, success, 24 pages
    1	[Page 1]
    2	100 Advanced Verilog & SystemVerilog Interview Questions
    3	Detailed answers, practical RTL examples, CDC, FSMs, timing, assertions, FIFOs, and verification concepts
    4	Interview-ready reference
    5	Designed as a concise technical study guide for RTL Design, Verification, FPGA, ASIC, and VLSI interviews.
    6	Topics include: RTL coding • SystemVerilog • CDC • FIFO • FSM • timing • SVA • verification • synthesis
    7	[Page 2]
    8	Contents
    9	Questions 1–10
    10	Questions 11–20
    11	Questions 21–30
    12	Questions 31–40
    13	Questions 41–50
    14	Questions 51–60
    15	Questions 61–70
    16	Questions 71–80
    17	Questions 81–90
    18	Questions 91–100
    19	Note: Examples are intentionally compact. Always check the exact coding standard and target technology flow used by your organization.
    20	[Page 3]
    21	1. Blocking vs. nonblocking assignments
    (more)
  card "UVM base classes: experienced-level interview questions" [d7b72c4e-e021-4f69-8ce8-a9f5063d0fd4] 35 lines
    1	# UVM base classes: experienced-level interview questions
    2	
    3	[Prasanthi Chanda](https://www.linkedin.com/in/prasanthi-chanda-484205245/) · Published April 4, 2025 · [Original LinkedIn post](https://www.linkedin.com/posts/prasanthi-chanda-484205245_mentor-guidance-training-share-7313873591983316993-bypP/)
    4	
    5	## Interview questions
    6	
    7	1. In a large verification environment, how would you efficiently propagate configurations from a `uvm_test` class to various components inside a `uvm_env`?
    8	
    9	2. Your testbench has synchronization issues where transactions sent by the `uvm_sequencer` reach the `uvm_driver` too late. How would you debug and fix this using UVM phases?
    10	
    11	3. You need a component to execute additional tasks after `run_phase` but before `check_phase`. Which UVM phase would you use, and how?
    12	
    13	4. A `uvm_sequence` must generate a burst of transactions with a burst size controlled dynamically at runtime. How would you implement this?
    14	
    15	5. How would you handle arbitration between multiple sequences running on the same `uvm_sequencer`?
    16	
    17	6. Explain the UVM factory mechanism. How does `set_type_override` differ from `set_inst_override`?
    18	
    19	7. How do you integrate functional coverage with UVM? What are the differences between `uvm_subscriber` and `uvm_analysis_port`?
    20	
    21	8. You are verifying AXI transactions that may complete out of order. How would you design the scoreboard to match transactions correctly?
    22	
    23	9. A `uvm_sequence` generates random stimulus, but conflicting constraints cause randomization failures. How would you debug and resolve the constraint issues?
    24	
    25	10. Your testbench has multiple interfaces, such as AXI and SPI. How would you use a virtual sequence to coordinate stimulus across both interfaces?
    26	
    27	## Original post image
    28	
    29	<hepta-placeholder tokenId="14" kind="image" nodeId="872a8e70-b10c-44d8-9363-d596978d6dfd" />
    30	
    31	---
    32	
    33	Source: [LinkedIn](https://www.linkedin.com/posts/prasanthi-chanda-484205245_mentor-guidance-training-share-7313873591983316993-bypP/)
    34	
    35	
  pdfCard "Advanced VLSI Verification Interview Handbook" [849130c7-eeb5-44e7-98e2-bfecd4931a8f] fileId: deb16f48-9385-4509-8e4a-faf09961fecb, success, 48 pages
    1	[Page 1]
    2	ADVANCED VLSI VERIFICATION INTERVIEWHANDBO
    3	SPECIALLY DESIGNED FOR THOSE AIMIDESIGN VERIFICATION INOIOP COMPANIE
    4	YOU NEED TO KNOW
    5	in Prasanthi Chanda
    6	[Page 2]
    7	1. How does the SystemVerilog scheduler work? Explain each region in detail.
    8	Answer:
    9	SystemVerilog uses a 4-phase event scheduler, which consists of:
    10	1. Active Region
    11	· Executes RTL code (always， initial, assign, Continuous assignments).
    12	·Executes blocking (=） and non-blocking (<=) statements.
    13	· SystemVerilog interface connections are resolved here.
    14	2. Inactive Region
    15	· Used for delaying updates. If a signal changes using <=, that change is scheduled here.
    16	· Mainly for consistent signal update ordering.
    17	3. NBA (Non-blocking Assignment) Region
    18	· All <= updates occur here.
    19	·Ensures updates don't affect the current simulation time slot.
    20	4. Observed Region (Postponed)
    21	·Assertions,monitors,and functional coverage are evaluated here.
    22	·No changes should be made here—it's for observing only.
    23	[Page 3]
    24	class transaction;
    25	rand bit [1:0] opcode;
    26	covergroup cg;
    27	coverpoint opcode;
    28	coverpoint status;
    29	cross opcode, status;
    30	endgroup
    31	· The cross captures combinations of values.
    32	· It helps identify which value pairs have been hit.
    33	·Can be enhanced using cross iff， bins,and ignore\_bins.
    34	[Page 4]
    35	3. Explain the concept of factory override in UVM with example.
    36	Answer:
    37	Factory override is used to replace a base class with a derived class at runtime, without changing the instantiation.
    38	class base\_txn extends uvm\_sequence\_item;
    39	uvm\_object\_utils(base\_txn)
    40	endclass
    41	class derived\_txn extends base\_txn;
    42	'uvm\_object\_utils(derived\_txn)
    43	endclass
    44	initial begin
    45	end
    46	· If any component uses
    47	base\_txn::type\_id::create("txn"), it will create a derived\_txn object.
    48	· Helpful in testcase flexibility without modifying code.
    49	[Page 5]
    50	4. What is the purpose of uvm config\_db#(..):set() and get()? Explain with example.
    51	Answer:
    52	Used to pass configuration data between testbench components using a central configuration mechanism.
    53	I Set in test
    54	uvm\_config\_db#(int):set(null, "env.agent",
    55	"bus\_width", 32);
    56	I/ Get in agent
    57	int bw;
    58	if (!uvm\_config\_db#(int)::get(this,"","bus\_width", bw))
    59	uvm\_fatal("CFG", "Bus width not set")
    60	· set()→ used by top-level components (like test)
    61	· get() → used by lower components (like agent, driver)
    62	· This avoids tight coupling between testbench components.
    63	[Page 6]
    64	Answer:
    65	Sequence layering refers to starting one sequence from another, often on different sequencers.
    66	· Used in multi-protocol testbenches or layered protocols (like TCP over IP).
    67	· Requires careful handling of arbitration and virtual sequencers.
    68	[Page 7]
    69	6. How to write parameterized classes in SystemVerilog? Explain with an example.
    70	Answer:
    71	function void write(T data); mem.push\_back(data); endfunction
    72	function T read(); return mem.pop\_front();   
    73	endfunction   
    74	endclass
    75	USAGE:
    76	fifo#(bit [7:0l) byte\_fifo = newO);   
    77	byte\_fifo.write(8'hA5);
    78	· Parameterized classes make code type-safe and reusable.
    79	[Page 11]
    80	9. Override base sequence with a derived one using string names in the UVM factory. Show instantiation using create().
    81	base\_seq s;
    82	[Page 12]
    83	· Uses string-based override.
    84	· Very useful when class names are passed/configured externally (e.g., YAML or JSON test configs).
    85	10. Write a class to generate a MAC address where:
    86	First byte must be even (multicast bit = 0).
    87	· Last byte must not be zero.
    88	[Page 13]
    89	· Shows bit slicing and constraints on parts of a rand variable.
    90	· Useful in L2 protocol testing or Ethernet MAC layer validation.
    91	[Page 14]
    92	11. Implement a scoreboard that matches outputs from two FIFOs, compares the result, and reports mismatches.
    93	[Page 16]
    94	Answer:
    95	· Introduces the virtual sequencer pattern,
    96	essential in UVM multi-agent testbenches.
    97	· Helps in layered and coordinated transactions.
    98	[Page 18]
    99	· This tests understanding of constraint dependencyordering， whichis criticalin avoiding constraint solver failures in complex hierarchies.
    100	14. Show how to call a SystemVerilog function from C using DPI-C import/export, to simulate a call-back scenario.
    101	Asnwer:
    102	// SystemVerilog Code:
    103	export "DPI-C" function sv\_callback;
    104	function void sv\_callback(int val);
    105	import "DPI-C" function void call\_sv\_callback();
    106	[Page 19]
    107	module tb;   
    108	initial begin call\_sv\_callback();   
    109	end   
    110	endmodule I C Code   
    111	#include <svdpi.h>   
    112	#include <stdio.h>   
    113	extern void sv\_callback(int val);   
    114	void call\_sv\_callback() {   
    115	sv\_callback(1234); I Call into SV from C
    116	
    117	This demonstrates SystemVerilog callbacks from C, useful in:
    118	· C-model simulation
    119	· Performance-critical IP verification
    120	· Co-simulation environments
    121	[Page 20]
    122	15. Implement a simple AXI-Lite monitor which uses both address and data channels and combines them to reconstruct transactions.
    123	Answer:
    124	[Page 21]
    125	· This tests deep understanding of multi-channel protocols, and how to recombine transactions.
    126	· Required for building accurate monitors and scoreboard models in UVM.
    127	[Page 22]
    128	· Advanced coverage model: bins created dynamically from random variables.
    129	· Important in adaptive coverage strategies in constraint-random testing.
    130	[Page 24]
    131	ip.start(vseqr.ip\_sequencer); end join\_any
    132	wait (ip.done)； / assume .done is triggered by ip\_seq
    133	'uvm\_info("TOPSEQ", "IP finished, continuing TCP", UVM\_LOW) endtask endclass
    134	· Tests advanced knowledge of parallel sequence execution, inter-sequence synchronization, and protocol layering.
    135	· Essential in SoC-level testbenches for multilayer packet processing (e.g., TCP/IP, USB stacks).
    136	18.Create a function that spawns a task with a time limit (timeout). If the task doesn't finish in time, terminate it.
    137	Answer:
    138	task automatic with\_timeout(task automatic input void\_func(), time timeout);
    139	process p;
    140	[Page 26]
    141	19. Implement a blocking thread-safe queue using semaphores. Multiple producers/consumers should safely enqueue and dequeue data.
    142	[Page 27]
    143	· Demonstrates explicit thread synchronization using semaphore.
    144	· Useful in modeling mutex-style testbench structures or simulated RTOS queues.
    145	20. Write a scenario with fork-join\_any, but stop all parallel threads once a task completes， using disable fork.
    146	Answer:
    147	[Page 28]
    148	· Advanced fork-join control with disable fork to kill sibling processes - heavily used in timeout, early-exit test environments.
    149	21. Create a simple Least Recently Used (LRU) cache of fixed size using a queue of class handles.
    150	[Page 30]
    151	· Strong example of OOP + data structure logic in SV.
    152	· Demonstrates ability to use queues, class handles, and indexing together - often asked to test algorithmic thinking in SV.
    153	22. Write a SystemVerilog assertion to detect if a signal sig goes high for less than 2 ns (i.e., a glitch).
    154	[Page 31]
    155	· This tests temporal logic and cycle-accurate pattern detection.
    156	· Real-world use: glitch detection, metastability bugs, or protocol violations.
    157	[Page 32]
    158	23. Demonstrate runtime polymorphism in SystemVerilog where a parent handle dynamically calls different overridden methods.
    159	[Page 33]
    160	· Tests your understanding of polymorphism, dynamic dispatch, and OOP structure in testbenches.
    161	· Commonly used in UVM factories, sequence selection, and layered verification.
    162	[Page 36]
    163	· Rare use case of randomizing associative arrays, showcasing deep understanding of constraint modeling.
    164	[Page 37]
    165	27. Create your own mini factory class to register and create types by name (like UVM factory but custom).
    166	[Page 38]
    167	function Packet UDP\_ctor(); return new UDPPacket(); endfunction
    168	initial begin
    169	endmodule
    170	· Shows how to replicate UVM-like factory behavior from scratch using typedefs, function pointers, and static arrays.
    171	· Highly useful to test abstraction and metaprogramming capabilities.
    172	[Page 40]
    173	· Prioritized arbitration is critical in DV for scheduling transactions or controlling stimulus flow.
    174	· Demonstrates mailbox-based scheduling, useful for bus arbitration models or testbench schedulers.
    175	[Page 41]
    176	29. Create a class that holds a dynamic array of class objects, where each inner object must satisfy constraints based on its index.
    177	[Page 44]
    178	31. Extend a base class to include a typedef struct that must be randomly assigned within range.
    179	[Page 45]
    180	· Rare use of randomizable structs inside class with inherited constraints.
    181	· Powerful for modeling packet headers, protocol formats, registers, etc.
    182	Answer:
    183	[Page 46]
    184	assert property(no\_glitch)
    185	else \$error("CDC Glitch Detected at time %0t", \$time);
    186	endmodule
    187	· This is gold-level verification logic, modeling synchronizer checks using assertions.
    188	· Such questions evaluate ability to design assertion-based CDC checks -very high signal integrity expertise.
    189	[Page 47]
    190	ADVANCED & TRICKY INTERVIEWQUESTIONS
    191	1.Override a constraint from the base class in the derived class such that the derived class object follows different rules.
    192	2.Design a sequence that triggers itself recursively using mailbox + fork-join\_none.
    193	3.Randomize an associative array such that:
    194	○ 5 keys starting with 'pkt\_0' to 'pkt\_4'
    195	○ All values are multiple of 3
    196	。 No values repeat
    197	4.Write an assertion that detects if data toggles more than once in a single clock cycle.
    198	5.Create a covergroup that checks all 1-hot patterns of a 4-bit signal.
    199	6.Create a FSM with 3 states,where each state waits random cycles (1-5) before moving on.
    200	7.Simulate weighted randomization (9o% chance of 1, 10% of 0) without using dist keyword.
    201	8.Check if bus req stays high but grant is never asserted within 5 cycles → raise error.
    202	9.Replicate UVM-style factory without UVM. Register class constructorsand call them dynamically.
    203	[Page 48]
    204	<image fileId="b607cadf-30a0-402f-bc06-9f8f75130230" sourceObjectId="849130c7-eeb5-44e7-98e2-bfecd4931a8f" sourceObjectType="pdfCard" />
    205	Excellence in World class VLSI Training & Placements
    206	Do follow for updates & enquires
    207	<image fileId="69c712c6-46d7-4fff-b6ff-b7fb10e2179b" sourceObjectId="849130c7-eeb5-44e7-98e2-bfecd4931a8f" sourceObjectType="pdfCard" />
    208	+91- 9182280927
  pdfCard "SV Assertion Scenarios QnA" [9d51adcf-6a07-416f-beab-110328b953b5] fileId: 02b7196b-bb78-47ef-b3c7-077738920e99, success, 9 pages
    1	[Page 1]
    2	1. Write an assertion check to make sure that a signal is high for a minimum of 2 cycles and a maximum of 6 cycles.
    3	[Page 2]
    4	4. Write an assertion checker to make sure that an output signal never goes X?
    5	5. Write an assertion to make sure that a 5-bit grant signal only has one bit set at any time?
    6	[Page 3]
    7	6. Write an assertion which checks that once a valid request is asserted by the master, the arbiter provides a grant within 2 to 5 clock cycles.
    8	7. How can you disable an assertion during active reset time?
    9	9. As long as signal\_a is up, signal\_b should not be asserted. Write an assertion.
    10	[Page 4]
    11	10. The signal\_a is a pulse; it can only be asserted for one cycle, and must be deasserted in the next cycle.
    12	11. Signal\_a and signal\_b can only be asserted together for one cycle; in the next cycle, at least one of them must be deasserted.
    13	12. When signal\_a is asserted, signal\_b must be asserted, and must remain up until one of the signals signal\_c or signal\_d is asserted.
    14	[Page 5]
    15	13. After signal\_a is asserted, signal\_b must be deasserted, and must stay down until the next signal\_a.
    16	14. If signal\_a is received while signal\_b is inactive, then on the next cycle signal\_c must be inactive, and signal\_b must be asserted.
    17	15. signal\_a must not be asserted together with signal\_b or with signal\_c.
    18	[Page 6]
    19	16. In a RESP operation, request must be true immediately, grant must be true 3 clock cycles later, followed by request being false, and then grant being false.
    20	17. Request must true at the current cycle; grant must become true sometime between 1 cycle after request and the end of time.
    21	18. Req must eventually be followed by ack, which must be followed 1 cycle later by done.
    22	\- AUGUSTIN JK
    23	[Page 7]
    24	19. The active-low reset must be low for at least 6 clock cycles.
    25	20. Enable must remain true throughout the entire ack to done sequence.
    26	21. Write an assertion for glitch detection.
    27	[Page 8]
    28	22. If signal\_a is active, then signal\_b was active 3 cycles ago.
    29	23. If the state machine reaches active1 state, it will eventually reach active2 state.
    30	24. Write an assertion: A high for 5 cycles and B high after 4 continuous highs of A and finally both A and B are high?
    31	\- AUGUSTIN JK
    32	[Page 9]
    33	25. Write an assertion: On rose of a, wait for rose of b or c. If b comes first, then d should be 1. If c comes first d should be zero.
  pdfCard "uvm interivew question" [01c41ff3-20ee-4aa3-99e0-c1ec1c0d51ec] fileId: 48167da9-f222-48ca-b54b-60bc85ca8422, success, 22 pages
section "Draft" [a5cf45ae-7b7b-4fd3-a247-c292926267d0]
  card "SVA Review" [be58e3c6-f6bb-4ff2-82ad-2eac1fb0cf11] 488 lines
    1	# SVA Review
    2	
    3	#interview/sva
    4	
    5	## 1. Immediate vs concurrent
    6	
    7	|   | Immediate | Concurrent |
    8	| --- | --- | --- |
    9	| Where | Procedural code (`always`, `initial`, tasks) | Module, interface, program, or `bind` file |
    10	| Timing | Evaluated when the statement executes | Clocked, evaluated on the clock edge across cycles |
    11	| Values | Current values (glitch-prone) | **Sampled** values (Preponed region) |
    12	| Keyword | `assert (expr)` | `assert property (...)` |
    13	| Use | Checks on a single point in time, in a checker/scoreboard | Temporal protocol rules |
    14	
    15	```verilog
    16	// Immediate (simple)
    17	always_comb assert (!(rd_en && empty)) else $error("read on empty");
    18	
    19	// Deferred immediate: filters out zero-delay glitches
    20	always_comb assert #0   (sel inside {[0:2]});
    21	always_comb assert final ($onehot0(grant));   // reported in Postponed region
    22	
    23	// Concurrent
    24	assert property (@(posedge clk) disable iff (!rst_n) req |-> ##[1:4] ack);
    25	```
    26	
    27	### Where SVA lives in the scheduler
    28	
    29	```mermaid
    (more)
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
    (more)
  card "NVIDIA DV (RDSS Intern) Interview Prep" [49fefe7e-5893-46d0-8931-b4d07b4fec25] 61 lines
    1	# NVIDIA DV (RDSS Intern) Interview Prep
    2	
    3	September 27, 2026 · @Xiao
    4	
    5	## How to use this guide
    6	
    7	These are the \~150 questions most likely to come up for the Multimedia IP DV intern role, picked from the question banks and matched to the JD and your resume. Each has a model answer you can say in about 60 seconds, plus the follow-ups interviewers usually add.
    8	
    9	- **\[T1]** = asked in almost every DV interview. Master these first.
    10	
    11	- **\[T2]** = likely to come up, especially in the test-plan or debug round.
    12	
    13	- **\[R]** = drawn from your resume. Expect the interviewer to go deep here.
    14	
    15	Answer pattern: give the one-line idea first, then draw it (waveform, FSM or block diagram), then write code, then name the corner cases. Talk while you write code.
    16	
    17	**Not covered on purpose:** analog circuits, deep out-of-order microarchitecture (Tomasulo, ROB internals) and LeetCode-style coding beyond the classics in Q8.12. If the process includes a coding round, practice 20–30 easy/medium problems separately (arrays, strings, hash maps, linked lists, two pointers, bit manipulation). Q6.23 covers multimedia basics; once you know whether the team works on codecs, display or camera, go one level deeper there.
    18	
    19	<hepta-mention type="card" id="5595fba8-3cb1-45e6-b06c-d818d427efa5">1. RTL design</hepta-mention>
    20	
    21	<hepta-mention type="card" id="1efcd3be-706f-4891-bc47-4524868e95f3">2. SystemVerilog and OOP</hepta-mention>
    22	
    23	<hepta-mention type="card" id="2ab9c37f-0fe2-4ed6-aefb-41f9b5d3f028">3. Constraint randomization</hepta-mention>
    24	
    25	<hepta-mention type="card" id="ec045ed7-dbaa-450f-975e-aaaf21109a6e">4. SVA</hepta-mention>
    26	
    27	<hepta-mention type="card" id="884e25b1-4126-4f3a-af42-adfc4eec245e">5. UVM</hepta-mention>
    28	
    29	<hepta-mention type="card" id="ed805f97-1fa2-433e-8de1-6415e65c5c80">6. Verification thinking: test plans, coverage, checkers, debug</hepta-mention>
    30	
    31	<hepta-mention type="card" id="059b8740-75d4-4bb6-b132-846b8de8f1d4">7. Resume deep-dive</hepta-mention>
    32	
    33	<hepta-mention type="card" id="6e20b76a-2daf-4c86-9425-fc73e9edd94e">8. Architecture, gates and scripting: quick hits</hepta-mention>
    34	
    35	<hepta-mention type="card" id="910c5b48-bf40-421b-b3c5-150a2c3af853">9. Behavioral, puzzle and questions to ask</hepta-mention>
    36	
    37	### Questions to ask the interviewer
    38	
    39	- What multimedia IP does the team own (video codec, display, camera/ISP), and at what stage is it now?
    40	
    41	- Does the team verify against C/C++ architecture models? How are they integrated with the UVM TB?
    42	
    43	- How is the team using AI agents today: test generation, debug triage, coverage analysis?
    44	
    45	- What would a strong RDSS intern have achieved by the end of the program?
    46	
    47	### Sources
    48	
    49	- TongXinTongXing DV question bank (Feb–Jul 2026), pasted into this project conversation.
    50	
    51	- [qingxuanxx/sv\_uvm\_axi\_notes](https://github.com/qingxuanxx/sv_uvm_axi_notes): SV 27, UVM 30 and AXI 40 Q&A sets, 95 verification interview reports, and the written-exam and scenario-question summaries.
    52	
    53	- VLSI Verify, The Art of Verification and ChipVerify UVM question sets, pasted into this conversation.
    54	
    55	- [2025 US + Taiwan DV job-search write-up (Dcard)](https://www.dcard.tw/f/tech_job/p/257943593).
    56	
    57	- NVIDIA Design Verification Engineer (RDSS Intern) job description, and your resume, from this project.
    58	
    59	- ProV Logic, *Top 50 Advanced UVM Interview Questions* (the PDF you uploaded): used to pick coding questions. Several of its sample answers contain the mistakes listed in Q5.29.
    60	
    61	
  card "C++ for DV Interviews — NVIDIA RDSS Prep" [472fb8cd-5c17-45ea-94dc-bd1422ff5099] 795 lines
    1	# C++ for DV Interviews — NVIDIA RDSS Prep
    2	
    3	#interview/cpp
    4	
    5	## How to use this doc
    6	
    7	DV coding rounds test practical fluency, not algorithm depth. Expect LeetCode Easy on arrays and strings, hash maps, bit tricks and log parsing. Reported NVIDIA DV rounds then ask "now write it in Verilog/SV", so every section pairs C++ with its SV equivalent. C++ maps closely to SV classes and the JD names C/C++ and OOP; for pure scripting questions, Python is usually accepted too.
    8	
    9	| Priority | Topic | Typical DV ask |
    10	| --- | --- | --- |
    11	| 5 | Strings and arrays | Remove duplicates, reverse, count occurrences |
    12	| 5 | `vector` / `unordered_map` / `unordered_set` | Error counts, unique values, frequency table |
    13	| 5 | Bit manipulation | Extract a field, set/clear bits, parity, `uint32_t` masks |
    14	| 5 | File I/O | Parse a simulation or regression log with `ifstream` |
    (more)
section "Dcard" [d653f680-8700-4f5f-9d8e-3e9eabe9a08e]
  card "Digital Design Interview Note" [95e4b524-aa48-4a87-b0ad-8afc0a44faaf] 326 lines
    1	# Digital Design Interview Note
    2	
    3	- [ICD Knowledge](https://hackmd.io/@mY6ukBHKSIG5P_4sveSdtA/HJ50IHfri#ICD-Knowledge)
    4	
    5	  - [Latch](https://hackmd.io/@mY6ukBHKSIG5P_4sveSdtA/HJ50IHfri#Latch)
    6	
    7	  - [Flip-flop](https://hackmd.io/@mY6ukBHKSIG5P_4sveSdtA/HJ50IHfri#Flip-flop)
    8	
    9	  - [Metastability](https://hackmd.io/@mY6ukBHKSIG5P_4sveSdtA/HJ50IHfri#Metastability)
    10	
    11	  - [Clock domain crossing (CDC)](https://hackmd.io/@mY6ukBHKSIG5P_4sveSdtA/HJ50IHfri#Clock-domain-crossing-CDC)
    12	
    (more)
  card "數位IC前段考題 正在更新中 - HackMD" [e67b193b-39e6-472a-a3d3-47842d57df32] 492 lines
    1	# 數位IC前段考題 正在更新中 - HackMD
    2	
    3	## Digital IC Design interview 正在更新中
    4	
    5	這是集結各前輩分享還有我自己面試後整理得面試考題
    6	reference
    7	
    8	1. [https://www.dcard.tw/f/tech\_job/p/238023076](https://www.dcard.tw/f/tech_job/p/238023076)
    9	
    10	2. [https://www.dcard.tw/f/tech\_job/p/240953224](https://www.dcard.tw/f/tech_job/p/240953224)
    11	
    12	3. [https://blog.csdn.net/gaoxcv/article/details/122090250](https://blog.csdn.net/gaoxcv/article/details/122090250)
    13	
    (more)
  card "2025 美國+台灣DV找工心得 (Design Verification)" [50018cbf-0f8e-43d0-ae1b-6d3f8efda11f] 470 lines
    1	# 2025 美國+台灣DV找工心得 (Design Verification)
    2	
    3	嗨 大家好，最近找工作告一段落，正式 Onboard 了。當初找工作時台灣跟美國都在找，而在美國大概面試了 20 幾面，只遇到兩三個講中文的人、0 台灣人，其他都是印度人，因此產生了寫這篇文章的想法。
    4	
    (more)

(unsectioned)
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
  (more)
card "The Art of Verification UVM Interview Questions" [dcf3d344-a4b5-43c6-98d0-bedd27cdad99] 901 lines
  1	# The Art of Verification UVM Interview Questions
  2	
  3	**In short:** These UVM interview questions cover the topics interviewers ask most: TLM ports and analysis ports, sequences and sequence items, the driver-sequencer handshake API, the factory and overrides, uvm\_config\_db, phasing, objections, RAL, and callbacks. Each answer includes real UVM code you can adapt. Work through them out loud and you will be ready to explain not just what each feature does but why it exists. Pair this with the wider [interview questions](https://theartofverification.com/category/interview-questions/) for full coverage.
  4	
  (more)
card "Design Verification interview question bank | Hardware Interview" [97744a20-a1ae-41ff-8f88-4b96d875dc7c] 1350 lines
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
  (more)
(24 partial)
