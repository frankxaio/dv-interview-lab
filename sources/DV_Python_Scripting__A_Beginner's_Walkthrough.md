card "DV Python Scripting: A Beginner's Walkthrough" [f32a9fde-cb58-4074-8115-7afe95a2531b] 1751 lines
--- Databases ---
- tag "clipper" [952b4c12-6872-4764-82fe-545db6267cb4]
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
27	  A **script** is a text file of instructions that Python runs top to bottom. You save it as `something.py` and run it from a terminal:
28	
29	  ```text
30	  python3 check_log.py logs/simv1.log
31	  └──┬──┘ └─────┬────┘ └──────┬─────┘
32	     │          │             └─ argument: the input you hand the script
33	     │          └─ the script file
34	     └─ the program that reads and runs the script
35	  ```
36	
37	  On Windows the command is usually `python` instead of `python3`.
38	
39	  ### Why DV engineers write scripts at all
40	
41	  A regression runs hundreds or thousands of simulations overnight. Each one writes a log file. Nobody reads 2,000 logs by hand. A script reads them, decides which tests passed, and writes one summary table.
42	
43	  ```text
44	   regression run                 your script                    you, next morning
45	  ┌──────────────┐            ┌──────────────────┐            ┌──────────────────┐
46	  │ simv1.log    │            │ read each log    │            │ summary.csv      │
47	  │ simv2.log    │ ─────────► │ find the counts  │ ─────────► │ simv1  FAIL      │
48	  │ simv3.log    │            │ decide PASS/FAIL │            │ simv2  PASS      │
49	  │ ... x 2000   │            │ write a table    │            │ simv3  ERROR     │
50	  └──────────────┘            └──────────────────┘            └──────────────────┘
51	  ```
52	
53	  ### What a UVM log looks like
54	
55	  At the end of a normal UVM simulation, the log has a **Report Summary** that counts messages by severity:
56	
57	  ```text
58	  UVM_INFO @ 0: reporter [RNTST] Running test base_test...
59	  UVM_ERROR /tb/scoreboard.sv(88) @ 1200: uvm_test_top.env.sb [MISMATCH] expected 0x5 got 0x7
60	  --- UVM Report Summary ---
61	
62	  ** Report counts by severity
63	  UVM_INFO :   12
64	  UVM_WARNING :    1
65	  UVM_ERROR :    5
66	  UVM_FATAL :   10
67	  ```
68	
69	  The script's whole job in Problem 01 is to find the `5` and the `10` and decide the test failed.
70	
71	  If the simulator **crashes**, it never reaches the summary, and the log just stops:
72	
73	  ```text
74	  UVM_INFO @ 0: start
75	  Segmentation fault
76	  ```
77	
78	  This is the single most important idea in the whole article: **a missing summary does not mean zero errors.** It means you don't know what happened. That case must be reported as ERROR, never PASS.
79	
80	  ### Exit codes
81	
82	  When a program finishes, it hands the operating system a small number called the **exit code**. The regression system (Jenkins, LSF, a Makefile) reads that number, not the text you print. The convention used here:
83	
84	  | Exit code | Meaning |
85	  | --- | --- |
86	  | 0 | PASS |
87	  | 1 | FAIL (the test ran and found errors) |
88	  | 2 | Can't decide (no summary, file missing, bad input) |
89	
90	  You can see the exit code of the last command yourself:
91	
92	  ```bash
93	  python3 check_log.py logs/simv1.log
94	  echo $?          # Linux/macOS prints the exit code; on Windows: echo %ERRORLEVEL%
95	  ```
96	
97	+ ## Part 1: The Python you need (and nothing more)
98	
99	  Read this once; come back to it when a line in Parts 2 to 4 confuses you.
100	
101	  ### Variables and `None`
102	
103	  ```python
104	  count = 5          # a variable named count now holds 5
105	  count = None       # None means "no value yet" / "not found"
106	  ```
107	
108	  `None` is how these scripts say "I looked and didn't find it." That is different from `0`, which means "I found it and it was zero." The whole false-PASS problem comes from mixing those two up.
109	
110	  ### Strings, indexing, slicing
111	
112	  A string is text. Each character has a position (an **index**) starting at 0:
113	
114	  ```text
115	  line = "UVM_ERROR :    5"
116	          0123456789...
117	          U is index 0, the space after "UVM_ERROR" is index 9, ":" is index 10
118	  ```
119	
120	  ```python
121	  line[0]        # "U"           one character
122	  line[10:]      # ":    5"      slice: from index 10 to the end
123	  line[:3]       # "UVM"         slice: from the start up to (not including) 3
124	  ```
125	
126	  Useful string methods:
127	
128	  | Method | What it does | Example | Result |
129	  | --- | --- | --- | --- |
130	  | `s.find(x)` | index where `x` first appears, or `-1` if absent | `"ab:c".find(":")` | `2` |
131	  | `s.find(x, start)` | same, but start looking at `start` | `"a:b:c".find(":", 2)` | `3` |
132	  | `s.lstrip()` | remove spaces from the left | `" 5".lstrip()` | `"5"` |
133	  | `s.strip()` | remove spaces from both ends | `" hi \n".strip()` | `"hi"` |
134	  | `s.startswith(x)` | does `s` begin with `x`? | `": 5".startswith(":")` | `True` |
135	  | `s.split()` | cut on whitespace into a list | `"id a b".split()` | `["id", "a", "b"]` |
136	
137	  ### Lists and tuples
138	
139	  ```python
140	  names = ["id", "metal_iron", "metal_gold"]   # list: ordered, changeable
141	  names[1]                                      # "metal_iron"
142	  len(names)                                    # 3
143	  names.index("metal_gold")                     # 2  (raises ValueError if absent)
144	
145	  pair = (5, 10)          # tuple: like a list but fixed
146	  errors, fatals = pair   # "unpacking": errors = 5, fatals = 10
147	  ```
148	
149	  ### `if`, `for`, `while`
150	
151	  ```python
152	  if errors > 0 or fatals > 0:
153	      print("FAIL")          # indented lines belong to the if
154	  else:
155	      print("PASS")
156	
157	  for name in names:         # run the indented block once per item
158	      print(name)
159	
160	  i = 0
161	  while i < 3:               # repeat while the condition is true
162	      i += 1                 # same as i = i + 1
163	  ```
164	
165	  **Indentation is the syntax.** Python uses the spaces at the start of a line to know which lines belong to an `if`, `for`, or function. Use 4 spaces consistently.
166	
167	  ### Functions
168	
169	  ```python
170	  def add(a, b):        # define a function named add with two inputs
171	      return a + b      # hand a value back to the caller
172	
173	  result = add(2, 3)    # result is 5
174	  ```
175	
176	  A function with no `return` (or a bare `return None`) gives back `None`.
177	
178	  ### Reading a file safely
179	
180	  ```python
181	  with open("simv1.log") as log_file:
182	      for line in log_file:      # one line at a time
183	          print(line)
184	  # the file is closed automatically here, even if an error happened
185	  ```
186	
187	  Looping over the file object reads **one line at a time**, so a 500 MB log never sits in memory all at once. `log_file.read()` would load the whole thing; that is what rule 4 warns against.
188	
189	  ### f-strings
190	
191	  ```python
192	  name, value = "metal_iron", "5.2"
193	  print(f"  {name}: {value}")    # prints "  metal_iron: 5.2"
194	  ```
195	
196	  The `f` before the quote lets you drop variables into `{ }`.
197	
198	  ### Errors (exceptions) and `try/except`
199	
200	  When something goes wrong, Python **raises an exception** and stops, unless you catch it:
201	
202	  ```python
203	  try:
204	      f = open("missing.log")
205	  except OSError as e:        # OSError covers "file not found", "permission denied", ...
206	      print("cannot read:", e)
207	  ```
208	
209	  Catch only the specific error you expect. `except Exception` catches *everything*, including typos in your own code, so a bug looks like "the log was bad" and you never find out.
210	
211	+ ## Part 2: Problem 01, parse one log and decide PASS/FAIL
212	
213	  **Goal:** read one log, find the `UVM_ERROR` and `UVM_FATAL` counts in the summary, print a verdict, return the right exit code.
214	
215	  The script has three functions, each with one job:
216	
217	  ```text
218	  main()                    reads the command line, prints the verdict, picks the exit code
219	    └─ parse_summary(path)  opens the file, walks every line, keeps the counts
220	         └─ extract_count(line, keyword)   looks at ONE line, returns a number or None
221	  ```
222	
223	  ### Step 1: `extract_count`, look at one line
224	
225	  ```python
226	  from string import digits      # digits is the string "0123456789"
227	
228	
229	  def extract_count(line, keyword):
230	      """Return the number after 'keyword :' in line, or None if there isn't one."""
231	      start = line.find(keyword)                          # (1)
232	      while start != -1:                                  # (2)
233	          rest = line[start + len(keyword):].lstrip()     # (3)
234	          if rest.startswith(":"):                        # (4)
235	              rest = rest[1:].lstrip()                    # (5)
236	              end = 0
237	              while end < len(rest) and rest[end] in digits:   # (6)
238	                  end += 1
239	              if end > 0:                                 # (7)
240	                  return int(rest[:end])
241	          start = line.find(keyword, start + 1)           # (8)
242	      return None                                         # (9)
243	  ```
244	
245	  1. Find where the keyword starts. `-1` means it's not on this line.
246	
247	  2. Keep trying as long as we found an occurrence.
248	
249	  3. Take everything **after** the keyword and drop leading spaces.
250	
251	  4. In the summary, the keyword is followed by a colon. If it isn't, this occurrence isn't the summary.
252	
253	  5. Drop the colon and any spaces after it.
254	
255	  6. Walk forward over digit characters to see how long the number is.
256	
257	  7. If there was at least one digit, convert that text to an integer and return it.
258	
259	  8. This occurrence wasn't it; search again **after** it.
260	
261	  9. No usable occurrence anywhere on the line.
262	
263	  #### Trace 1: a summary line
264	
265	  `line = "UVM_ERROR : 5\n"`, `keyword = "UVM_ERROR"`
266	
267	  | Step | Value |
268	  | --- | --- |
269	  | (1) `start` | `0` (keyword is at the very beginning) |
270	  | (3) `line[9:]` | `" : 5\n"` → after `.lstrip()`: `": 5\n"` |
271	  | (4) starts with `":"`? | yes |
272	  | (5) `rest` | `"5\n"` |
273	  | (6) walk digits | `rest[0]` is `"5"` → `end = 1`; `rest[1]` is `"\n"` → stop |
274	  | (7) return | `int("5")` = **`5`** |
275	
276	  #### Trace 2: an error *message* (not the summary)
277	
278	  `line = "UVM_ERROR /tb/scoreboard.sv(88) @ 1200: ..."`
279	
280	  | Step | Value |
281	  | --- | --- |
282	  | (1) `start` | `0` |
283	  | (3) `rest` | `"/tb/scoreboard.sv(88) @ 1200: ..."` |
284	  | (4) starts with `":"`? | **no**, starts with `/` |
285	  | (8) search again | no second `UVM_ERROR` → `-1` |
286	  | (9) return | **`None`** |
287	
288	  That's the reason for the colon check: without it, the script would read the `88` from the file path as an error count.
289	
290	  #### Why `string.digits` and not `isdigit()`
291	
292	  `"²".isdigit()` is `True` (superscript two counts as a digit to Unicode), but `int("²")` crashes. Checking `ch in "0123456789"` accepts exactly the characters `int()` can handle.
293	
294	  #### Why not a regex?
295	
296	  A regular expression like `r"UVM_ERROR\s*:\s*(\d+)"` would also work. The article's point is that `find` + slicing is easier to *explain out loud* in an interview, and each step is easy to check by hand, like the traces above.
297	
298	  ### Step 2: `parse_summary`, walk every line
299	
300	  ```python
301	  def parse_summary(path):
302	      """Return (error_count, fatal_count), or None if the log has no summary."""
303	      error_count = fatal_count = None                              # (1)
304	      with open(path, encoding="utf-8", errors="replace") as log_file:  # (2)
305	          for line in log_file:                                     # (3)
306	              value = extract_count(line, "UVM_ERROR")
307	              if value is not None:                                 # (4)
308	                  error_count = value
309	              value = extract_count(line, "UVM_FATAL")
310	              if value is not None:
311	                  fatal_count = value
312	
313	      if error_count is None and fatal_count is None:               # (5)
314	          return None
315	      return error_count or 0, fatal_count or 0                     # (6)
316	  ```
317	
318	  1. Start both counts at `None`: "haven't seen them yet."
319	
320	  2. Open the file. `errors="replace"` means a stray non-UTF-8 byte in the log becomes `�` instead of crashing the script. Simulator logs sometimes contain odd bytes.
321	
322	  3. One line at a time (rule 4: no `read()`).
323	
324	  4. Use `is not None`, not `if value:`. `if value:` would treat a count of `0` as "not found", because `0` counts as false in Python.
325	
326	  5. Found neither count anywhere → no summary → return `None`. The caller treats that as ERROR.
327	
328	  6. `error_count or 0` means "use `error_count`, but if it's `None`, use `0`." This covers a log that printed one count but not the other.
329	
330	  Because the loop overwrites the count every time it finds one, **the last summary wins** if the log happens to contain more than one.
331	
332	  ### Step 3: `main`, verdict and exit code
333	
334	  ```python
335	  import sys
336	
337	
338	  def main():
339	      if len(sys.argv) != 2:                                   # (1)
340	          print("usage: python check_log.py <log_file>")
341	          return 2
342	
343	      path = sys.argv[1]
344	      try:
345	          result = parse_summary(path)
346	      except OSError as e:                                     # (2)
347	          print(f"ERROR: cannot read {path}: {e}")
348	          return 2
349	
350	      if result is None:                                       # (3)
351	          print(f"ERROR: no UVM Report Summary in {path}")
352	          return 2
353	
354	      errors, fatals = result                                  # (4)
355	      if errors > 0 or fatals > 0:
356	          print(f"TEST FAILED (UVM_ERROR={errors}, UVM_FATAL={fatals})")
357	          return 1
358	
359	      print("TEST PASSED")
360	      return 0
361	
362	
363	  if __name__ == "__main__":                                   # (5)
364	      sys.exit(main())
365	  ```
366	
367	  1. `sys.argv` is the list of words on the command line. For `python3 check_log.py simv1.log` it's `["check_log.py", "simv1.log"]`, so a correct call has exactly 2 entries.
368	
369	  2. Catch only `OSError` (file missing, no permission). A bug in `extract_count` would still crash loudly, which is what you want while developing.
370	
371	  3. No summary → exit 2, never PASS.
372	
373	  4. Unpack the tuple and decide.
374	
375	  5. This line means "run `main()` only when this file is run directly." If another script *imports* this file (Problem 02 does), `main()` doesn't run. `sys.exit(...)` hands main's return value to the OS as the exit code.
376	
377	  ### The decision, as one picture
378	
379	  ```text
380	                   ┌────────────────────┐
381	                   │ can we open file?  │──no──► ERROR, exit 2
382	                   └─────────┬──────────┘
383	                            yes
384	                   ┌─────────▼──────────┐
385	                   │ found any summary  │──no──► ERROR, exit 2   (crash / truncated log)
386	                   │ count on any line? │
387	                   └─────────┬──────────┘
388	                            yes
389	                   ┌─────────▼──────────┐
390	                   │ ERROR > 0 or       │──yes─► FAIL,  exit 1
391	                   │ FATAL > 0 ?        │
392	                   └─────────┬──────────┘
393	                             no
394	                             ▼
395	                        PASS, exit 0
396	  ```
397	
398	  ### Real output
399	
400	  ```text
401	  $ python3 check_log.py logs/simv1.log
402	  TEST FAILED (UVM_ERROR=5, UVM_FATAL=10)        exit=1
403	  $ python3 check_log.py logs/simv2.log
404	  TEST PASSED                                    exit=0
405	  $ python3 check_log.py logs/simv3.log
406	  ERROR: no UVM Report Summary in logs/simv3.log exit=2
407	  ```
408	
409	+ ## Part 3: Problem 02, summarize a whole directory
410	
411	  **Goal:** go through every `.log` file in a folder, judge each one, write a table with columns `FILE_NAME, ERROR_COUNT, FATAL_COUNT, STATUS`.
412	
413	  It reuses Problem 01's `parse_summary` instead of copying it:
414	
415	  ```python
416	  from check_log import parse_summary     # check_log.py must be in the same folder
417	  ```
418	
419	  ### The function split
420	
421	  ```text
422	  main()
423	   ├─ process_log_directory(log_dir)   find + sort the .log files
424	   │    └─ analyze_log(path)           one file → one row  (calls parse_summary)
425	   ├─ write_csv(rows, path)
426	   └─ write_excel(rows, path)          optional
427	  ```
428	
429	  Interviewers like this split because each function does one thing and can be tested alone.
430	
431	  ### `pathlib.Path` in 30 seconds
432	
433	  `Path` is the modern way to handle file paths:
434	
435	  ```python
436	  from pathlib import Path
437	  p = Path("logs/simv10.log")
438	  p.name          # "simv10.log"
439	  p.suffix        # ".log"
440	  p.is_file()     # True if it exists and is a regular file
441	  Path("logs").iterdir()   # every entry inside the folder
442	  ```
443	
444	  ### `natural_key`: sorting `simv2` before `simv10`
445	
446	  Sort file names as plain text and you get:
447	
448	  ```text
449	  simv1.log, simv10.log, simv2.log, simv3.log     ← "1" < "2" character by character
450	  ```
451	
452	  Humans expect `simv1, simv2, simv3, simv10`. The fix is to cut each name into text pieces and number pieces, and compare numbers as numbers.
453	
454	  ```python
455	  from itertools import groupby
456	  from string import digits
457	
458	
459	  def natural_key(name):
460	      key = []
461	      for is_num, chars in groupby(name, key=lambda ch: ch in digits):
462	          text = "".join(chars)
463	          key.append((0, int(text)) if is_num else (1, text))
464	      return key
465	  ```
466	
467	  `groupby` walks the characters and groups neighbors that give the same answer to "is this a digit?":
468	
469	  ```text
470	  "simv10.log"
471	   s i m v │ 1 0 │ . l o g
472	   not     │digit│ not
473	     ▼        ▼      ▼
474	  (1,"simv") (0,10) (1,".log")
475	  ```
476	
477	  So `natural_key("simv10.log")` is `[(1, "simv"), (0, 10), (1, ".log")]` and `natural_key("simv2.log")` is `[(1, "simv"), (0, 2), (1, ".log")]`. Python compares these lists item by item: first items tie, then `(0, 2) < (0, 10)` because `2 < 10`. So `simv2` sorts first.
478	
479	  The leading `0` / `1` tag keeps Python from ever comparing a number with a string (which would crash): a number piece always sorts before a text piece in the same position.
480	
481	  `lambda ch: ch in digits` is a tiny unnamed function. It means the same as:
482	
483	  ```python
484	  def is_digit_char(ch):
485	      return ch in digits
486	  ```
487	
488	  ### `analyze_log`: one file → one row
489	
490	  ```python
491	  def analyze_log(path):
492	      row = {"FILE_NAME": path.name, "ERROR_COUNT": "", "FATAL_COUNT": "", "STATUS": "ERROR"}
493	      try:
494	          result = parse_summary(path)
495	      except OSError as e:
496	          print(f"warning: cannot read {path.name}: {e}", file=sys.stderr)
497	          return row
498	
499	      if result is None:          # no summary -> ERROR, never PASS
500	          return row
501	
502	      errors, fatals = result
503	      row["ERROR_COUNT"] = errors
504	      row["FATAL_COUNT"] = fatals
505	      row["STATUS"] = "FAIL" if errors > 0 or fatals > 0 else "PASS"
506	      return row
507	  ```
508	
509	  A **dict** (`{ key: value }`) is a lookup table: `row["STATUS"]` gives that field. The row **starts out as ERROR** and only becomes PASS or FAIL when real counts are found. Starting pessimistic is a safe habit: if anything is skipped by mistake, the result is ERROR, not a false PASS.
510	
511	  `file=sys.stderr` sends warnings to the error stream so they don't mix with normal output.
512	
513	  ### `process_log_directory`: find and filter
514	
515	  ```python
516	  def process_log_directory(log_dir):
517	      log_files = [p for p in log_dir.iterdir() if p.is_file() and p.suffix == ".log"]
518	      log_files.sort(key=lambda p: natural_key(p.name))
519	      return [analyze_log(p) for p in log_files]
520	  ```
521	
522	  The first line is a **list comprehension**, a compact `for` loop that builds a list. Written out longhand:
523	
524	  ```python
525	  log_files = []
526	  for p in log_dir.iterdir():
527	      if p.is_file() and p.suffix == ".log":
528	          log_files.append(p)
529	  ```
530	
531	  The filter matters: the folder may hold last night's `summary.csv` or a subfolder. Without the `.log` check, the script would "analyze" its own previous report.
532	
533	  ### `write_csv` and `write_excel`
534	
535	  ```python
536	  def write_csv(rows, out_path):
537	      with open(out_path, "w", newline="", encoding="utf-8") as f:
538	          writer = csv.DictWriter(f, fieldnames=COLUMNS)
539	          writer.writeheader()
540	          writer.writerows(rows)
541	
542	
543	  def write_excel(rows, out_path):
544	      import pandas as pd     # imported here so CSV works without pandas
545	      pd.DataFrame(rows, columns=COLUMNS).to_excel(out_path, index=False)
546	  ```
547	
548	  - `csv` is built into Python; `DictWriter` turns each dict into one line, columns in the order of `COLUMNS`.
549	
550	  - `newline=""` prevents blank lines between rows on Windows.
551	
552	  - `pandas` is an **extra** package that might not be installed on a lab server. Importing it *inside* `write_excel` means the script only needs pandas if you ask for Excel. CSV always works.
553	
554	  ### `main` with `argparse`
555	
556	  ```python
557	  def main():
558	      parser = argparse.ArgumentParser(description="Summarize UVM regression logs.")
559	      parser.add_argument("log_dir", type=Path, help="directory containing .log files")
560	      parser.add_argument("--csv", type=Path, default=Path("summary.csv"))
561	      parser.add_argument("--excel", type=Path, help="optional .xlsx output")
562	      args = parser.parse_args()
563	      ...
564	  ```
565	
566	  `argparse` reads the command line for you and gives free `--help` output:
567	
568	  ```bash
569	  python3 summarize_logs.py logs                      # writes summary.csv
570	  python3 summarize_logs.py logs --csv out.csv        # choose the CSV name
571	  python3 summarize_logs.py logs --excel out.xlsx     # also write Excel
572	  python3 summarize_logs.py --help                    # prints usage
573	  ```
574	
575	  Never hard-code a path like `/home/xiao/regress/logs` in the script; it breaks on everyone else's machine.
576	
577	  At the end, `main` picks one exit code for the whole regression: 2 if any log was ERROR, else 1 if any FAIL, else 0.
578	
579	  ### Real output
580	
581	  The test folder held `simv1.log`, `simv2.log`, `simv3.log` (crashed), `simv10.log`, and an old `summary.csv`:
582	
583	  ```text
584	  $ python3 summarize_logs.py logs --csv logs/summary.csv
585	  wrote logs/summary.csv                     exit=2
586	
587	  FILE_NAME,ERROR_COUNT,FATAL_COUNT,STATUS
588	  simv1.log,5,10,FAIL
589	  simv2.log,0,0,PASS
590	  simv3.log,,,ERROR
591	  simv10.log,2,0,FAIL
592	  ```
593	
594	  Note the three things the article warned about, all handled: natural order (`simv10` last), the old CSV ignored, and the crashed log reported as ERROR.
595	
596	  ### The "online answer" bugs, explained
597	
598	  | Bug | What happens |
599	  | --- | --- |
600	  | `os.isfile(p)` | `AttributeError`; the function lives at `os.path.isfile` |
601	  | `re.search(pattern)` | `TypeError`; you must also pass the string to search |
602	  | `try: ... except Exception: status = "ERROR"` around everything | Each of the bugs above gets caught, so **every** file silently becomes ERROR. The report looks plausible and is completely wrong. A crash would at least tell you something is broken. |
603	
604	---
605	
606	## Part 4: Problem 03, pull the `metal_*` columns
607	
608	**Goal:** `data.txt` is a whitespace-separated table. The first line is the column names. Print each row's `id` plus every column whose name starts with `metal_`.
609	
610	```text
611	id metal_iron metal_gold temperature
612	1 5.2 0.3 98.6
613	```
614	
615	### The core idea: find column *positions* from the header
616	
617	```text
618	header = ["id", "metal_iron", "metal_gold", "temperature"]
619	index:     0         1             2              3
620	
621	id_i  = 0          (where "id" is)
622	metal = [1, 2]     (where the metal_ columns are)
623	
624	row   = ["1", "5.2", "0.3", "98.6"]
625	         row[0]  row[1]  row[2]
626	          id      iron    gold
627	```
628	
629	You look up positions once from the header, then use the same positions for every data row. Positions, not hard-coded numbers, because the column order may change next week.
630	
631	### The parsing function
632	
633	```python
634	def parse_metal(lines):
635	    rows = [l.split() for l in lines if l.strip()]       # (1)
636	    if not rows:                                         # (2)
637	        raise ValueError("file is empty")
638	
639	    header = rows[0]
640	    if "id" not in header:                               # (3)
641	        raise ValueError(f"no 'id' column in header: {header}")
642	    id_i = header.index("id")
643	    metal = [i for i, n in enumerate(header) if n.startswith("metal_")]   # (4)
644	
645	    records = []
646	    for row_no, v in enumerate(rows[1:], start=1):       # (5)
647	        if len(v) != len(header):                        # (6)
648	            print(f"warning: data row {row_no} has {len(v)} fields, "
649	                  f"expected {len(header)}; skipped", file=sys.stderr)
650	            continue
651	        records.append((v[id_i], [(header[i], v[i]) for i in metal]))
652	    return records
653	```
654	
655	1. Split every line into a list of words, **skipping blank lines** (`l.strip()` is `""` for a blank line, which counts as false). Without this, a trailing empty line becomes `[]` and `v[id_i]` crashes.
656	
657	2. Empty file → `rows[0]` would crash with an unhelpful `IndexError`. Raise a clear message instead.
658	
659	3. Same idea for a missing `id` column.
660	
661	4. `enumerate(header)` gives `(0, "id"), (1, "metal_iron"), ...`; keep the index `i` when the name `n` starts with `metal_`.
662	
663	5. `rows[1:]` is every row except the header. `enumerate(..., start=1)` numbers them 1, 2, 3 for the warning message.
664	
665	6. A short row would make `v[i]` crash. Warn, skip with `continue`, and keep going with the other rows.
666	
667	`raise ValueError(...)` deliberately creates an error with a message. `main` catches exactly that type and prints it.
668	
669	### Printing is a separate function
670	
671	```python
672	def print_metal(records):
673	    for row_id, values in records:
674	        print("ID:", row_id)
675	        for name, value in values:
676	            print(f"  {name}: {value}")
677	```
678	
679	Why split? `parse_metal` returns data instead of printing it, so a test can check it directly:
680	
681	```python
682	assert parse_metal(["id metal_x", "7 1.5"]) == [("7", [("metal_x", "1.5")])]
683	```
684	
685	You can't easily test a function whose only effect is printing.
686	
687	### Real output
688	
689	Test file, with a short row and blank lines on purpose:
690	
691	```text
692	id metal_iron metal_gold temperature
693	1 5.2 0.3 98.6
694	2 4.1
695	
696	3 1.0 2.0 50.0
697	```
698	
699	```text
700	$ python3 metal_columns.py data.txt
701	warning: data row 2 has 2 fields, expected 4; skipped
702	ID: 1
703	  metal_iron: 5.2
704	  metal_gold: 0.3
705	ID: 3
706	  metal_iron: 1.0
707	  metal_gold: 2.0
708	exit=0
709	
710	$ python3 metal_columns.py bad.txt          # header is "x y"
711	ERROR: bad.txt: no 'id' column in header: ['x', 'y']     exit=2
712	
713	$ python3 metal_columns.py empty.txt
714	ERROR: empty.txt: file is empty                           exit=2
715	```
716	
717	---
718	
719	## Part 5: Try it yourself
720	
721	1. Install Python 3 if `python3 --version` doesn't print a version.
722	
723	2. Put `check_log.py`, `summarize_logs.py`, and `metal_columns.py` in one folder.
724	
725	3. Make a `logs` folder next to them and create these files with any text editor:
726	
727	   `logs/simv1.log`
728	
729	   ```text
730	   UVM_ERROR /tb/scoreboard.sv(88) @ 1200: uvm_test_top.env.sb [MISMATCH]
731	   --- UVM Report Summary ---
732	   UVM_ERROR :    5
733	   UVM_FATAL :   10
734	   ```
735	
736	   `logs/simv2.log`
737	
738	   ```text
739	   --- UVM Report Summary ---
740	   UVM_ERROR :    0
741	   UVM_FATAL :    0
742	   ```
743	
744	   `logs/simv3.log`
745	
746	   ```text
747	   UVM_INFO @ 0: start
748	   Segmentation fault
749	   ```
750	
751	4. Run:
752	
753	   ```bash
754	   python3 check_log.py logs/simv1.log
755	   python3 summarize_logs.py logs
756	   python3 metal_columns.py data.txt
757	   ```
758	
759	5. Then break things on purpose and predict the result before you run it:
760	
761	   - Change `UVM_ERROR : 0` to `UVM_ERROR:0` (no spaces). Still works? (Yes: `lstrip` handles zero spaces too.)
762	
763	   - Delete the two summary lines from `simv2.log`. What's its STATUS now?
764	
765	   - Replace `if value is not None:` with `if value:` and run `simv2.log`. Why does it now say ERROR instead of PASS?
766	
767	   That last experiment is the best one to talk through in an interview.
768	
769	---
770	
771	## Part 6: Cheat sheet
772	
773	| Concept | One-line meaning |
774	| --- | --- |
775	| `None` | "not found / no value", different from `0` |
776	| `is not None` | the safe way to check "did I find it", because `0` is falsy |
777	| `x or 0` | use `x`, or `0` if `x` is `None` |
778	| `s.find(k)` | position of `k` in `s`, `-1` if absent |
779	| `s[a:b]` | the slice from index `a` up to (not including) `b` |
780	| `for line in f:` | read a file one line at a time |
781	| `with open(...)` | open a file and close it automatically |
782	| `[f(x) for x in xs if cond]` | list comprehension: build a list in one line |
783	| `enumerate(xs)` | loop with `(index, item)` pairs |
784	| `sys.argv` | list of command-line words |
785	| `argparse` | proper command-line options with `--help` |
786	| `sys.exit(n)` | finish with exit code `n` |
787	| `if __name__ == "__main__":` | run `main()` only when executed directly, not when imported |
788	| `except OSError` | catch file problems only; let real bugs crash |
789	| `raise ValueError(msg)` | stop with a clear error message |
790	
791	### The five interview talking points, now with reasons
792	
793	1. **No summary ≠ pass.** A crash produces no summary; treating that as 0 errors hides the failure.
794	
795	2. **Exit codes are for the regression system.** Automation reads the number, not your printed text.
796	
797	3. **Catch only expected exceptions.** `except Exception` hides your own bugs.
798	
799	4. **Separate parsing from output.** Functions that return data can be unit-tested.
800	
801	5. **`find`**** + slicing over regex for a fixed format.** Easier to explain, trace, and get right.
802	
803	---
804	
805	## Practice problems
806	
807	One key problem for each section above, in the same order. Try each one before opening its answer.
808	
809	### Part 0: What a script is and how to run one
810	
811	#### Why DV engineers write scripts at all
812	
813	**Problem (Easy): Spot the false PASS**
814	
815	A nightly regression produced 2,000 logs: 1,990 have a summary with zero errors, 6 have a summary with errors, and 4 stopped early with no summary. A teammate's script reports `1994 PASS, 6 FAIL`. What went wrong, and what should the report say?
816	
817	+ **Answer**
818	
819	    The 4 logs with no summary were counted as PASS. The script treated "found no error count" as "zero errors."
820	
821	    The correct report is `1990 PASS, 6 FAIL, 4 ERROR`. The 4 crashed runs need a human to look at them, so they must not hide inside the PASS count.
822	
823	#### What a UVM log looks like
824	
825	**Problem (Easy): Classify the log endings**
826	
827	Decide PASS, FAIL or ERROR for each log ending:
828	
829	- (a) A summary with `UVM_ERROR :    0` and `UVM_FATAL :    0`
830	
831	- (b) A summary with `UVM_ERROR :    0` and `UVM_FATAL :    1`
832	
833	- (c) The line `UVM_ERROR /tb/env.sv(12) @ 50: uvm_test_top [TIMEOUT] watchdog expired`, then `Killed`, and no summary
834	
835	+ **Answer**
836	
837	    (a) PASS. Both counts are present and both are 0.
838	
839	    (b) FAIL. Any fatal is a failure.
840	
841	    (c) ERROR. The log contains an error message, but no summary, so you don't know how many errors there were or what happened after `Killed`. A message line is not a count.
842	
843	#### Exit codes
844	
845	**Problem (Easy): One exit code for a whole regression**
846	
847	Write `regression_exit_code(statuses)`. It returns 2 if any status is `"ERROR"`, otherwise 1 if any is `"FAIL"`, otherwise 0. An empty list (no logs found) must return 2.
848	
849	```text
850	["PASS", "PASS"]          -> 0
851	["PASS", "FAIL"]          -> 1
852	["FAIL", "ERROR", "PASS"] -> 2
853	[]                        -> 2
854	```
855	
856	+ **Answer**
857	
858	  ```python
859	  def regression_exit_code(statuses):
860	      if not statuses or "ERROR" in statuses:
861	          return 2
862	      if "FAIL" in statuses:
863	          return 1
864	      return 0
865	  ```
866	
867	    An empty regression returns 2 because "nothing ran" is not "everything passed."
868	
869	```test
870	assert regression_exit_code(["PASS", "PASS"]) == 0
871	assert regression_exit_code(["PASS", "FAIL"]) == 1
872	assert regression_exit_code(["FAIL", "ERROR", "PASS"]) == 2
873	assert regression_exit_code([]) == 2
874	```
875	
876	### Part 1: The Python you need (and nothing more)
877	
878	#### Variables and None
879	
880	**Problem (Easy): Describe a count**
881	
882	Write `describe(count)`. It returns `"not found"` for `None`, `"zero"` for 0, and `"found N"` otherwise.
883	
884	```text
885	describe(None) -> "not found"
886	describe(0)    -> "zero"
887	describe(7)    -> "found 7"
888	```
889	
890	+ **Answer**
891	
892	  ```python
893	  def describe(count):
894	      if count is None:
895	          return "not found"
896	      if count == 0:
897	          return "zero"
898	      return "found " + str(count)
899	  ```
900	
901	    Check for `None` first, using `is None`. If you write `if not count:`, 0 and `None` both become `"not found"`.
902	
903	```test
904	assert describe(None) == "not found"
905	assert describe(0) == "zero"
906	assert describe(7) == "found 7"
907	```
908	
909	#### Strings, indexing, slicing
910	
911	**Problem (Easy): Value after the colon**
912	
913	Using only `find` and slicing, write `value_after_colon(s)`. It returns the text after the first `:`, with spaces stripped from both ends, or `None` if there's no colon.
914	
915	```text
916	"UVM_INFO :   12" -> "12"
917	"a:b:c"           -> "b:c"
918	"no colon here"   -> None
919	```
920	
921	+ **Answer**
922	
923	  ```python
924	  def value_after_colon(s):
925	      i = s.find(":")
926	      if i == -1:
927	          return None
928	      return s[i + 1:].strip()
929	  ```
930	
931	```test
932	assert value_after_colon("UVM_INFO :   12") == "12"
933	assert value_after_colon("a:b:c") == "b:c"
934	assert value_after_colon("no colon here") is None
935	```
936	
937	#### Lists and tuples
938	
939	**Problem (Easy): Index without crashing**
940	
941	Write `safe_index(items, x)`. It returns the position of `x`, or `None` if `x` isn't in the list. Don't use try/except.
942	
943	+ **Answer**
944	
945	  ```python
946	  def safe_index(items, x):
947	      if x not in items:
948	          return None
949	      return items.index(x)
950	  ```
951	
952	```test
953	assert safe_index(["id", "metal_iron"], "metal_iron") == 1
954	assert safe_index(["id"], "temperature") is None
955	```
956	
957	#### if, for, while
958	
959	**Problem (Easy): First failing test**
960	
961	`results` is a list of `(name, errors, fatals)` tuples. Write `first_failing(results)`. It returns the name of the first test with `errors > 0` or `fatals > 0`, or `None` if all of them pass.
962	
963	```text
964	first_failing([("simv1", 0, 0), ("simv2", 0, 3), ("simv3", 1, 0)]) -> "simv2"
965	first_failing([("simv1", 0, 0)])                                   -> None
966	```
967	
968	+ **Answer**
969	
970	  ```python
971	  def first_failing(results):
972	      for name, errors, fatals in results:
973	          if errors > 0 or fatals > 0:
974	              return name
975	      return None
976	  ```
977	
978	    You can unpack the tuple right in the `for` line.
979	
980	```test
981	assert first_failing([("simv1", 0, 0), ("simv2", 0, 3), ("simv3", 1, 0)]) == "simv2"
982	assert first_failing([("simv1", 0, 0)]) is None
983	```
984	
985	#### Functions
986	
987	**Problem (Easy): The missing return**
988	
989	```python
990	def check(x):
991	    if x > 0:
992	        return "FAIL"
993	
994	print(check(3), check(0))
995	```
996	
997	+ **Answer**
998	
999	  ```output
1000	  FAIL None
1001	  ```
1002	
1003	    When `x <= 0`, the function reaches the end without a `return`, so it gives back `None`. Fix it by adding `return "PASS"` as the last line.
1004	
1005	#### Reading a file safely
1006	
1007	**Problem (Medium): Last meaningful line**
1008	
1009	When a simulation crashes, the last line of the log usually tells you why. Write `last_line(path)`. It returns the last non-blank line with its spaces stripped, or `None` if every line is blank. Don't use `read()`.
1010	
1011	```text
1012	"UVM_INFO @ 0: start\nSegmentation fault\n\n" -> "Segmentation fault"
1013	"\n\n"                                       -> None
1014	```
1015	
1016	+ **Answer**
1017	
1018	  ```python
1019	  def last_line(path):
1020	      last = None
1021	      with open(path, encoding="utf-8", errors="replace") as f:
1022	          for line in f:
1023	              if line.strip():
1024	                  last = line.strip()
1025	      return last
1026	  ```
1027	
1028	    Keeping only the latest non-blank line means memory use stays flat even for a 500 MB log.
1029	
1030	```test
1031	assert last_line(make_file("UVM_INFO @ 0: start\nSegmentation fault\n\n")) == "Segmentation fault"
1032	assert last_line(make_file("\n\n")) is None
1033	assert last_line(make_file("")) is None
1034	```
1035	
1036	#### f-strings
1037	
1038	**Problem (Easy): Predict the output**
1039	
1040	```python
1041	name, errors, fatals = "simv1.log", 5, 10
1042	print(f"{name}: UVM_ERROR={errors}, UVM_FATAL={fatals}")
1043	print(f"{name:<12}|{errors:>3}|")
1044	print("{errors}")
1045	```
1046	
1047	+ **Answer**
1048	
1049	  ```output
1050	  simv1.log: UVM_ERROR=5, UVM_FATAL=10
1051	  simv1.log   |  5|
1052	  {errors}
1053	  ```
1054	
1055	    `:<12` left-aligns the value in a field 12 characters wide, and `:>3` right-aligns it in 3. The last line has no `f` before the quote, so the braces print as plain text. Forgetting the `f` is a common bug.
1056	
1057	#### Errors (exceptions) and try/except
1058	
1059	**Problem (Medium): Find the hidden bug**
1060	
1061	Every log in the regression comes out as ERROR, even the good ones. Why?
1062	
1063	```python
1064	def status_for(path):
1065	    try:
1066	        reslt = parse_summary(path)
1067	        errors, fatals = result
1068	        return "FAIL" if errors > 0 or fatals > 0 else "PASS"
1069	    except Exception:
1070	        return "ERROR"
1071	```
1072	
1073	+ **Answer**
1074	
1075	    There's a typo: the code assigns `reslt` but then reads `result`. That raises `NameError` on every call. `except Exception` catches the `NameError` too, so the bug looks like "every log was bad." A summary-less log (`None`) would also be swallowed here as a `TypeError`.
1076	
1077	    The fix is to catch only the error you expect, around only the call that can raise it:
1078	
1079	  ```python
1080	  def status_for(path):
1081	      try:
1082	          result = parse_summary(path)
1083	      except OSError:
1084	          return "ERROR"
1085	      if result is None:
1086	          return "ERROR"
1087	      errors, fatals = result
1088	      return "FAIL" if errors > 0 or fatals > 0 else "PASS"
1089	  ```
1090	
1091	```test
1092	assert status_for(make_file("UVM_ERROR : 0\nUVM_FATAL : 0\n")) == "PASS"
1093	assert status_for(make_file("UVM_ERROR : 2\n")) == "FAIL"
1094	assert status_for(make_file("crash\n")) == "ERROR"
1095	assert status_for("/no/such/file.log") == "ERROR"
1096	```
1097	
1098	### Part 2: Problem 01, parse one log and decide PASS/FAIL
1099	
1100	#### Step 1: extract\_count, look at one line
1101	
1102	**Problem (Easy): Predict the output**
1103	
1104	```python
1105	print(extract_count("UVM_FATAL :   10", "UVM_FATAL"))
1106	print(extract_count("UVM_ERROR: 3", "UVM_ERROR"))
1107	print(extract_count("UVM_ERROR : x5", "UVM_ERROR"))
1108	print(extract_count("UVM_ERROR : 12abc", "UVM_ERROR"))
1109	print(extract_count("UVM_ERRORS : 4", "UVM_ERROR"))
1110	print(extract_count("UVM_ERROR @ 5: x UVM_ERROR : 7", "UVM_ERROR"))
1111	```
1112	
1113	+ **Answer**
1114	
1115	  ```output
1116	  10
1117	  3
1118	  None
1119	  12
1120	  None
1121	  7
1122	  ```
1123	
1124	  - Line 2: `lstrip()` works when there are zero spaces too.
1125	
1126	  - Line 3: there are no digits right after the colon, so step (7) is skipped.
1127	
1128	  - Line 4: the digit walk stops at `a`.
1129	
1130	  - Line 5: after `UVM_ERROR` comes `S`, not a colon.
1131	
1132	  - Line 6: the first occurrence fails the colon check, and step (8) finds the second one.
1133	
1134	#### Trace 1: a summary line
1135	
1136	**Problem (Medium): Leading spaces**
1137	
1138	Trace `extract_count("   UVM_ERROR :5", "UVM_ERROR")`. What is `start`, and what is returned?
1139	
1140	+ **Answer**
1141	
1142	    `start` is 3, because three spaces come before the keyword. `line[3 + 9:]` is `" :5"`, which becomes `":5"` after `lstrip`. Step (5) leaves `rest = "5"`, `end` becomes 1, and the function returns 5. Spaces before the keyword don't matter because `find` locates it wherever it is.
1143	
1144	```test
1145	assert extract_count("   UVM_ERROR :5", "UVM_ERROR") == 5
1146	assert "   UVM_ERROR :5".find("UVM_ERROR") == 3
1147	```
1148	
1149	#### Trace 2: an error message (not the summary)
1150	
1151	**Problem (Medium): Why the colon check matters**
1152	
1153	A teammate replaces steps (4) to (6) with "take the first run of digits anywhere after the keyword." Predict the output:
1154	
1155	```python
1156	from string import digits
1157	
1158	def naive_count(line, keyword):
1159	    rest = line[line.find(keyword) + len(keyword):]
1160	    i = 0
1161	    while i < len(rest) and rest[i] not in digits:
1162	        i += 1
1163	    end = i
1164	    while end < len(rest) and rest[end] in digits:
1165	        end += 1
1166	    return int(rest[i:end]) if end > i else None
1167	
1168	print(naive_count("UVM_ERROR /tb/scoreboard.sv(88) @ 1200: mismatch", "UVM_ERROR"))
1169	print(naive_count("UVM_ERROR @ 1200: timeout", "UVM_ERROR"))
1170	print(naive_count("UVM_ERROR :    5", "UVM_ERROR"))
1171	```
1172	
1173	+ **Answer**
1174	
1175	  ```output
1176	  88
1177	  1200
1178	  5
1179	  ```
1180	
1181	    Only the last line is a real count. On a log with a single error message, this version reports 88 or 1200 errors. It still says FAIL there, but with a wrong number. Worse, when the keyword is missing, `find` returns -1 and `line[-1 + 9:]` quietly slices from index 8 of an unrelated line. The colon check is what tells a summary line apart from a message line.
1182	
1183	#### Why string.digits and not isdigit()
1184	
1185	**Problem (Medium): What does int() accept?**
1186	
1187	Which of these succeed, and what do they return?
1188	
1189	```python
1190	for s in ["²", "٣", " 12 ", "1_000", "-5"]:
1191	    try:
1192	        print(repr(s), int(s))
1193	    except ValueError:
1194	        print(repr(s), "ValueError")
1195	```
1196	
1197	+ **Answer**
1198	
1199	  ```output
1200	  '²' ValueError
1201	  '٣' 3
1202	  ' 12 ' 12
1203	  '1_000' 1000
1204	  '-5' -5
1205	  ```
1206	
1207	    `isdigit()` and `int()` disagree in both directions, which is a good reason to define your own rule. Checking `ch in digits` and then calling `int(rest[:end])` accepts exactly plain ASCII digits, and `int()` handles every one of them.
1208	
1209	#### Why not a regex?
1210	
1211	**Problem (Medium): Same behavior, written as a regex**
1212	
1213	Write `extract_count_re(line, keyword)` with the `re` module so it returns the same value as `extract_count` on these lines:
1214	
1215	```text
1216	"UVM_ERROR :    5"                          -> 5
1217	"UVM_ERROR:0"                               -> 0
1218	"UVM_ERROR /tb/scoreboard.sv(88) @ 1200: x" -> None
1219	"UVM_ERRORS : 4"                            -> None
1220	"UVM_ERROR @ 5: x UVM_ERROR : 7"            -> 7
1221	"UVM_ERROR : ٣"                             -> None
1222	```
1223	
1224	+ **Answer**
1225	
1226	  ```python
1227	  import re
1228	
1229	  def extract_count_re(line, keyword):
1230	      match = re.search(re.escape(keyword) + r"\s*:\s*([0-9]+)", line)
1231	      return int(match.group(1)) if match else None
1232	  ```
1233	
1234	    Use `[0-9]`, not `\d`. In Python 3, `\d` matches any Unicode digit, so it would accept `٣`. `re.escape` protects you if the keyword ever contains characters that mean something in a regex, such as `.` or `[`.
1235	
1236	```test
1237	for line in ["UVM_ERROR :    5", "UVM_ERROR:0", "UVM_ERROR /tb/scoreboard.sv(88) @ 1200: x",
1238	             "UVM_ERRORS : 4", "UVM_ERROR @ 5: x UVM_ERROR : 7", "UVM_ERROR : ٣", "nothing"]:
1239	    assert extract_count_re(line, "UVM_ERROR") == extract_count(line, "UVM_ERROR"), line
1240	```
1241	
1242	#### Step 2: parse\_summary, walk every line
1243	
1244	**Problem (Medium): Break it on purpose**
1245	
1246	Replace both `if value is not None:` checks with `if value:`. What does the new version return for a log whose summary says `UVM_ERROR :    0` and `UVM_FATAL :    0`, and what verdict does `main` print?
1247	
1248	+ **Answer**
1249	
1250	    It returns `None`, and `main` prints `ERROR: no UVM Report Summary`. The count 0 is falsy, so `if value:` never stores it. Both counts stay `None`, and the function reports "no summary." A clean test now shows up as ERROR.
1251	
1252	  ```python
1253	  def parse_summary_buggy(lines):
1254	      error_count = fatal_count = None
1255	      for line in lines:
1256	          value = extract_count(line, "UVM_ERROR")
1257	          if value:
1258	              error_count = value
1259	          value = extract_count(line, "UVM_FATAL")
1260	          if value:
1261	              fatal_count = value
1262	      if error_count is None and fatal_count is None:
1263	          return None
1264	      return error_count or 0, fatal_count or 0
1265	
1266	  assert parse_summary_buggy(["UVM_ERROR :    0", "UVM_FATAL :    0"]) is None
1267	  ```
1268	
1269	#### Step 3: main, verdict and exit code
1270	
1271	**Problem (Medium): Delete the ****`__name__`**** guard**
1272	
1273	Suppose `check_log.py` ends with a bare `sys.exit(main())` and no `if __name__ == "__main__":`. You then run `python3 summarize_logs.py logs`, which does `from check_log import parse_summary`. What happens?
1274	
1275	+ **Answer**
1276	
1277	    Importing a file runs it top to bottom, so `main()` runs during the import. `sys.argv` is `["summarize_logs.py", "logs"]`, which has 2 entries, so `main` tries to `parse_summary("logs")`. Opening a directory raises `IsADirectoryError`, an `OSError`. `main` prints `ERROR: cannot read logs: ...` and `sys.exit(2)` ends the whole program before the summarizer does any work.
1278	
1279	#### The decision, as one picture
1280	
1281	**Problem (Easy): Classify the scenarios**
1282	
1283	Walk the diagram for each case and give the verdict and exit code:
1284	
1285	- (a) The log exists, but you don't have read permission.
1286	
1287	- (b) The log's only count line is `UVM_FATAL :    0`.
1288	
1289	- (c) The log is an empty file.
1290	
1291	- (d) The summary shows `UVM_ERROR : 0`, `UVM_FATAL : 3`.
1292	
1293	- (e) The path you passed is a directory.
1294	
1295	+ **Answer**
1296	
1297	    (a) ERROR, 2 (`PermissionError` is an `OSError`). (b) PASS, 0, because a count was found and `error_count or 0` gives `(0, 0)`. (c) ERROR, 2 (no summary). (d) FAIL, 1. (e) ERROR, 2 (`IsADirectoryError` is an `OSError`).
1298	
1299	#### Real output
1300	
1301	**Problem (Easy): New logs**
1302	
1303	What do `check_log.py` and `$?` show for these two logs?
1304	
1305	`simv4.log`:
1306	
1307	```text
1308	--- UVM Report Summary ---
1309	UVM_WARNING :   30
1310	UVM_ERROR :    0
1311	UVM_FATAL :    0
1312	```
1313	
1314	`simv5.log`, which was truncated partway through the summary:
1315	
1316	```text
1317	--- UVM Report Summary ---
1318	UVM_ERROR :    0
1319	UVM_FAT
1320	```
1321	
1322	+ **Answer**
1323	
1324	    `simv4.log` prints `TEST PASSED` and exits 0, because warnings aren't counted.
1325	
1326	    `simv5.log` also prints `TEST PASSED` and exits 0. `UVM_ERROR` was found, and the missing fatal count turns into 0 through `fatal_count or 0`. A truncated summary ends up as a pass, which is a gap in the card's design. To close it, require both counts: change `and` to `or` in the "not found" check and drop the `or 0`.
1327	
1328	```test
1329	assert parse_summary(make_file("--- UVM Report Summary ---\nUVM_WARNING :   30\nUVM_ERROR :    0\nUVM_FATAL :    0\n")) == (0, 0)
1330	assert parse_summary(make_file("--- UVM Report Summary ---\nUVM_ERROR :    0\nUVM_FAT\n")) == (0, 0)
1331	```
1332	
1333	### Part 3: Problem 02, summarize a whole directory
1334	
1335	#### The function split
1336	
1337	**Problem (Easy): Where does the change go?**
1338	
1339	For each request, name the function or functions you'd edit:
1340	
1341	- (a) Add a `WARNING_COUNT` column.
1342	
1343	- (b) Also look for logs in subfolders.
1344	
1345	- (c) Write a JSON report as well as the CSV.
1346	
1347	- (d) Treat any `UVM_WARNING` greater than 0 as FAIL.
1348	
1349	+ **Answer**
1350	
1351	    (a) `analyze_log`, which fills the new key, and `COLUMNS`, which `write_csv` and `write_excel` read. Counting warnings also needs a small change where the counts are parsed. (b) `process_log_directory` only. (c) A new `write_json(rows, path)` plus one call in `main`. (d) `analyze_log`, the line that sets `STATUS`. Each request touches one or two small functions, and that's the benefit of the split.
1352	
1353	#### pathlib.Path in 30 seconds
1354	
1355	**Problem (Easy): Predict the output**
1356	
1357	```python
1358	from pathlib import Path
1359	
1360	p = Path("regress/logs/simv10.log.gz")
1361	print(p.name)
1362	print(p.suffix)
1363	print(p.suffixes)
1364	print(p.stem)
1365	print(p.parent)
1366	print(p.with_suffix(".txt"))
1367	print(Path("logs") / "simv1.log")
1368	```
1369	
1370	+ **Answer**
1371	
1372	  ```output
1373	  simv10.log.gz
1374	  .gz
1375	  ['.log', '.gz']
1376	  simv10.log
1377	  regress/logs
1378	  regress/logs/simv10.log.txt
1379	  logs/simv1.log
1380	  ```
1381	
1382	    `suffix` gives only the last extension, so a compressed `simv10.log.gz` fails the card's `p.suffix == ".log"` filter. The `/` operator joins paths without you managing slashes, and it uses the right separator on Windows.
1383	
1384	#### natural\_key: sorting simv2 before simv10
1385	
1386	**Problem (Medium): Why the 0/1 tag?**
1387	
1388	Suppose you drop the tag and write `key.append(int(text) if is_num else text)`. What happens with `sorted(["a1", "1a"], key=bad_key)`?
1389	
1390	```python
1391	from itertools import groupby
1392	from string import digits
1393	
1394	def bad_key(name):
1395	    key = []
1396	    for is_num, chars in groupby(name, key=lambda ch: ch in digits):
1397	        text = "".join(chars)
1398	        key.append(int(text) if is_num else text)
1399	    return key
1400	
1401	try:
1402	    print(sorted(["a1", "1a"], key=bad_key))
1403	except TypeError as e:
1404	    print("TypeError:", e)
1405	```
1406	
1407	+ **Answer**
1408	
1409	  ```output
1410	  TypeError: '<' not supported between instances of 'int' and 'str'
1411	  ```
1412	
1413	    `"a1"` gives `["a", 1]` and `"1a"` gives `[1, "a"]`. Comparing their first items means comparing `1` with `"a"`, and Python 3 won't do that. With the tag, the first items become `(1, "a")` and `(0, 1)`, which compare on the tags first.
1414	
1415	#### analyze\_log: one file → one row
1416	
1417	**Problem (Medium): Optimistic default**
1418	
1419	A teammate changes the row to start with `"STATUS": "PASS"`. Later someone adds `if path.stat().st_size == 0: return row` at the top to skip empty files. What does an empty log now report, and what would it have reported with the card's version?
1420	
1421	+ **Answer**
1422	
1423	    With the optimistic default, the empty log reports PASS, because the early `return row` sends back the default. With the card's pessimistic default, the same early return gives ERROR. Every code path that forgets to set a status falls back to the default, so the default should be the safe answer.
1424	
1425	#### process\_log\_directory: find and filter
1426	
1427	**Problem (Easy): Predict what gets processed**
1428	
1429	A folder contains `simv1.log`, `simv10.log`, `simv2.log`, `summary.csv`, `notes.LOG`, `simv3.log.gz`, and a subfolder `old/`. In what order does `process_log_directory` analyze the files, and which ones does it skip?
1430	
1431	+ **Answer**
1432	
1433	    It analyzes `simv1.log`, `simv2.log`, `simv10.log`, in that order. It skips `summary.csv` (wrong suffix), `notes.LOG` (the suffix check is case-sensitive), `simv3.log.gz` (its suffix is `.gz`), and `old/` (not a file).
1434	
1435	```test
1436	d = Path(tempfile.mkdtemp())
1437	for n in ["simv1.log", "simv10.log", "simv2.log", "summary.csv", "notes.LOG", "simv3.log.gz"]:
1438	    (d / n).write_text("UVM_ERROR : 0\nUVM_FATAL : 0\n")
1439	(d / "old").mkdir()
1440	assert [r["FILE_NAME"] for r in process_log_directory(d)] == ["simv1.log", "simv2.log", "simv10.log"]
1441	```
1442	
1443	#### write\_csv and write\_excel
1444	
1445	**Problem (Easy): Round trip**
1446	
1447	Write `read_csv_rows(path)`, which uses `csv.DictReader` to return a list of dicts. After `write_csv([{"FILE_NAME": "simv1.log", "ERROR_COUNT": 5, "FATAL_COUNT": 10, "STATUS": "FAIL"}], p)`, what is `read_csv_rows(p)[0]["ERROR_COUNT"]`?
1448	
1449	+ **Answer**
1450	
1451	  ```python
1452	  import csv
1453	
1454	  def read_csv_rows(path):
1455	      with open(path, newline="", encoding="utf-8") as f:
1456	          return list(csv.DictReader(f))
1457	  ```
1458	
1459	    The value is `"5"`, a string, not the int 5. A CSV file stores only text, so convert with `int(...)` when you read it back.
1460	
1461	```test
1462	p = Path(tempfile.mkdtemp()) / "s.csv"
1463	write_csv([{"FILE_NAME": "simv1.log", "ERROR_COUNT": 5, "FATAL_COUNT": 10, "STATUS": "FAIL"}], p)
1464	assert read_csv_rows(p)[0]["ERROR_COUNT"] == "5"
1465	```
1466	
1467	#### main with argparse
1468	
1469	**Problem (Easy): Predict the parse**
1470	
1471	```python
1472	import argparse
1473	from pathlib import Path
1474	
1475	parser = argparse.ArgumentParser()
1476	parser.add_argument("log_dir", type=Path)
1477	parser.add_argument("--csv", type=Path, default=Path("summary.csv"))
1478	parser.add_argument("--excel", type=Path)
1479	
1480	args = parser.parse_args(["logs", "--csv", "out.csv"])
1481	print(args.log_dir, args.csv, args.excel)
1482	args = parser.parse_args(["logs"])
1483	print(args.csv)
1484	try:
1485	    parser.parse_args([])
1486	except SystemExit as e:
1487	    print("exit code", e.code)
1488	```
1489	
1490	+ **Answer**
1491	
1492	  ```output
1493	  logs out.csv None
1494	  summary.csv
1495	  exit code 2
1496	  ```
1497	
1498	    A missing required argument makes argparse print a usage message to stderr and exit with 2. That happens to match the "can't decide" code.
1499	
1500	#### Real output
1501	
1502	**Problem (Medium): A bigger folder**
1503	
1504	Start from the card's test folder (`simv1.log`, `simv2.log`, `simv3.log` (crashed), `simv10.log`, and the old `summary.csv`). Add `simv11.log`, whose only count line is `UVM_ERROR : 0`, plus `notes.txt` and a subfolder `old/simv0.log`. Predict the CSV rows and the exit code.
1505	
1506	+ **Answer**
1507	
1508	  ```text
1509	  FILE_NAME,ERROR_COUNT,FATAL_COUNT,STATUS
1510	  simv1.log,5,10,FAIL
1511	  simv2.log,0,0,PASS
1512	  simv3.log,,,ERROR
1513	  simv10.log,2,0,FAIL
1514	  simv11.log,0,0,PASS
1515	  ```
1516	
1517	    The exit code is 2 because `simv3.log` is ERROR. `notes.txt` and `old/` are skipped. `simv11.log` is PASS because one count was enough (a parser that requires both counts would make it ERROR).
1518	
1519	```test
1520	d = Path(tempfile.mkdtemp())
1521	(d / "simv1.log").write_text("UVM_ERROR : 5\nUVM_FATAL : 10\n")
1522	(d / "simv2.log").write_text("UVM_ERROR : 0\nUVM_FATAL : 0\n")
1523	(d / "simv3.log").write_text("UVM_INFO @ 0: start\nSegmentation fault\n")
1524	(d / "simv10.log").write_text("UVM_ERROR : 2\nUVM_FATAL : 0\n")
1525	(d / "simv11.log").write_text("UVM_ERROR : 0\n")
1526	(d / "summary.csv").write_text("old")
1527	(d / "notes.txt").write_text("x")
1528	(d / "old").mkdir(); (d / "old" / "simv0.log").write_text("UVM_ERROR : 9\n")
1529	rows = process_log_directory(d)
1530	assert [(r["FILE_NAME"], r["STATUS"]) for r in rows] == [("simv1.log", "FAIL"), ("simv2.log", "PASS"), ("simv3.log", "ERROR"), ("simv10.log", "FAIL"), ("simv11.log", "PASS")]
1531	```
1532	
1533	#### The "online answer" bugs, explained
1534	
1535	**Problem (Medium): Count the bugs**
1536	
1537	This function returns `"ERROR"` for every file, including a perfectly clean one. List every bug.
1538	
1539	```python
1540	import os, re
1541	
1542	def status_of(path):
1543	    try:
1544	        if not os.isfile(path):
1545	            return "ERROR"
1546	        text = open(path).read()
1547	        m = re.search(r"UVM_ERROR\s*:\s*(\d+)")
1548	        return "FAIL" if int(m.group(1)) > 0 else "PASS"
1549	    except Exception:
1550	        return "ERROR"
1551	
1552	print(status_of(make_file("UVM_ERROR : 0\nUVM_FATAL : 0\n")))
1553	```
1554	
1555	+ **Answer**
1556	
1557	  ```output
1558	  ERROR
1559	  ```
1560	
1561	  1. `os.isfile` doesn't exist; it's `os.path.isfile`. This raises `AttributeError`.
1562	
1563	  2. `re.search` is missing the string to search, which raises `TypeError`.
1564	
1565	  3. `except Exception` swallows both errors, so the result is always ERROR.
1566	
1567	  4. `open(path).read()` loads the whole file and never closes it explicitly.
1568	
1569	  5. `UVM_FATAL` is never checked, so a log with fatals but 0 errors would PASS.
1570	
1571	  6. If there's no match, `m` is `None`, and `m.group` crashes. That's swallowed too, so it happens to come out as ERROR, but by luck rather than design.
1572	
1573	  7. `\d` accepts non-ASCII digits.
1574	
1575	### Part 4: Problem 03, pull the metal\_\* columns
1576	
1577	#### The core idea: find column positions from the header
1578	
1579	**Problem (Easy): Positions by prefix**
1580	
1581	Write `column_positions(header, prefix)`. It returns the list of indexes whose column name starts with `prefix`.
1582	
1583	```text
1584	column_positions(["id", "metal_iron", "metal_gold", "temperature"], "metal_") -> [1, 2]
1585	column_positions(["id", "temperature"], "metal_")                             -> []
1586	```
1587	
1588	+ **Answer**
1589	
1590	  ```python
1591	  def column_positions(header, prefix):
1592	      return [i for i, name in enumerate(header) if name.startswith(prefix)]
1593	  ```
1594	
1595	```test
1596	assert column_positions(["id", "metal_iron", "metal_gold", "temperature"], "metal_") == [1, 2]
1597	assert column_positions(["id", "temperature"], "metal_") == []
1598	```
1599	
1600	#### The parsing function
1601	
1602	**Problem (Medium): Predict the return value and warnings**
1603	
1604	```python
1605	records = parse_metal(["id metal_a x", "", "1 2 3", "2 4", "   ", "3 5 6"])
1606	print(records)
1607	```
1608	
1609	What's printed, and what warning goes to stderr?
1610	
1611	+ **Answer**
1612	
1613	  ```output
1614	  [('1', [('metal_a', '2')]), ('3', [('metal_a', '5')])]
1615	  ```
1616	
1617	    The warning on stderr is `warning: data row 2 has 2 fields, expected 3; skipped`. Blank and spaces-only lines are removed before numbering, so `"2 4"` is data row 2. Every value is still a string.
1618	
1619	#### Printing is a separate function
1620	
1621	**Problem (Medium): Write the tests**
1622	
1623	Write three `assert`-based tests for `parse_metal`: blank lines are ignored, a short row is skipped, and a missing `id` column raises `ValueError`.
1624	
1625	+ **Answer**
1626	
1627	  ```python
1628	  assert parse_metal(["id metal_x", "", "7 1.5", ""]) == [("7", [("metal_x", "1.5")])]
1629	
1630	  assert parse_metal(["id metal_x", "7", "8 2.0"]) == [("8", [("metal_x", "2.0")])]
1631	
1632	  try:
1633	      parse_metal(["x y", "1 2"])
1634	      raise AssertionError("expected ValueError")
1635	  except ValueError as e:
1636	      assert "no 'id' column" in str(e)
1637	  ```
1638	
1639	    The third test fails if no error is raised. Checking the message confirms you got the right `ValueError`.
1640	
1641	#### Real output
1642	
1643	**Problem (Medium): A new data file**
1644	
1645	`data2.txt` contains:
1646	
1647	```text
1648	metal_cu id metal_zn
1649	0.5 A 1.1
1650	0.7 B
1651	0.9 C 1.3 extra
1652	```
1653	
1654	What does `python3 metal_columns.py data2.txt` print to stdout and stderr, and what's the exit code?
1655	
1656	+ **Answer**
1657	
1658	    stderr:
1659	
1660	  ```text
1661	  warning: data row 2 has 2 fields, expected 3; skipped
1662	  warning: data row 3 has 4 fields, expected 3; skipped
1663	  ```
1664	
1665	    stdout:
1666	
1667	  ```text
1668	  ID: A
1669	    metal_cu: 0.5
1670	    metal_zn: 1.1
1671	  ```
1672	
1673	    The exit code is 0, because skipped rows are warnings, not errors. A row with too many fields is skipped too, since `len(v) != len(header)` covers both directions. `id` doesn't have to be the first column.
1674	
1675	```test
1676	import io, contextlib
1677	out = io.StringIO()
1678	with contextlib.redirect_stdout(out):
1679	    print_metal(parse_metal(["metal_cu id metal_zn", "0.5 A 1.1", "0.7 B", "0.9 C 1.3 extra"]))
1680	assert out.getvalue() == "ID: A\n  metal_cu: 0.5\n  metal_zn: 1.1\n"
1681	```
1682	
1683	### Part 5: Try it yourself
1684	
1685	**Problem (Medium): Predict before you run**
1686	
1687	Predict `summarize_logs.py`'s STATUS for each edit, then check:
1688	
1689	- (a) Delete the two summary lines from `simv2.log`.
1690	
1691	- (b) Append a second summary to the end of `simv1.log` with `UVM_ERROR : 0` and `UVM_FATAL : 0`.
1692	
1693	- (c) Change `simv2.log`'s line to `UVM_ERROR :    5abc`.
1694	
1695	- (d) Save `simv2.log` with one byte that isn't valid UTF-8, for example `é` saved as Latin-1, on the `UVM_INFO` line.
1696	
1697	+ **Answer**
1698	
1699	    (a) ERROR, because there's no summary.
1700	
1701	    (b) PASS. The last summary wins, which may be wrong for a test that reports twice. Decide whether "worst summary wins" is the better rule.
1702	
1703	    (c) FAIL with `ERROR_COUNT` 5, because the digit walk stops at `a`.
1704	
1705	    (d) Still PASS. `errors="replace"` turns the bad byte into `�` instead of crashing.
1706	
1707	```test
1708	d = Path(tempfile.mkdtemp())
1709	assert analyze_log(make_file("--- UVM Report Summary ---\n", "a.log", d))["STATUS"] == "ERROR"
1710	assert analyze_log(make_file("UVM_ERROR : 5\nUVM_FATAL : 10\nUVM_ERROR : 0\nUVM_FATAL : 0\n", "b.log", d))["STATUS"] == "PASS"
1711	r = analyze_log(make_file("UVM_ERROR :    5abc\nUVM_FATAL :    0\n", "c.log", d)); assert r["STATUS"] == "FAIL" and r["ERROR_COUNT"] == 5
1712	p = d / "d.log"; p.write_bytes("UVM_INFO café\nUVM_ERROR : 0\nUVM_FATAL : 0\n".encode("latin-1"))
1713	assert analyze_log(p)["STATUS"] == "PASS"
1714	```
1715	
1716	### Part 6: Cheat sheet
1717	
1718	**Problem (Easy): Predict all six**
1719	
1720	```python
1721	x = None
1722	print(x or 0)
1723	print(0 or None)
1724	print("abc".find("z"))
1725	print("UVM_INFO"[4:])
1726	print([i for i, n in enumerate(["a", "metal_b", "metal_c"]) if n.startswith("metal_")])
1727	print("found" if 0 is not None else "missing")
1728	```
1729	
1730	+ **Answer**
1731	
1732	  ```output
1733	  0
1734	  None
1735	  -1
1736	  INFO
1737	  [1, 2]
1738	  found
1739	  ```
1740	
1741	    `0 or None` gives `None`, because `or` returns the second value whenever the first is falsy, including 0. That's why `error_count or 0` is only safe for turning `None` into 0. The last line shows that `is not None` correctly treats 0 as found.
1742	
1743	#### The five interview talking points, now with reasons
1744	
1745	**Problem (Medium): "How could a crash pass?"**
1746	
1747	The interviewer asks: "Your script reported PASS for a test that segfaulted. How could that happen, and how does your design prevent it?" Answer in 3 or 4 sentences.
1748	
1749	+ **Answer**
1750	
1751	    Sample answer: "A crash stops the log before the Report Summary, so there are no counts to find. If the parser starts its counts at 0, or uses `if value:`, 'found nothing' looks the same as 'found zero,' and the test passes. My parser starts at `None`, checks `is not None`, and if neither count appears it returns `None`, which the caller reports as ERROR with exit code 2. So a missing summary can never become a PASS."
