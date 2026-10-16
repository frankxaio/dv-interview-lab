#!/usr/bin/env python3
"""Run positive and deliberately failing traces against four shipped SVA examples.

Requires vcs in PATH. Compiler and simulation logs are kept in the printed temp dir.
"""
import json,re,subprocess,tempfile,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
qs=json.loads((ROOT/'data/solutions/codex-sv-sva.json').read_text())
if not shutil.which('vcs'): raise SystemExit('Source the VCS setup before running this check.')
root=Path(tempfile.mkdtemp(prefix='dvlab-sva-'))
print('Verification logs:',root,flush=True)
def first_assert(code):
 start=code.index('assert property');i=code.index('(',start);level=0
 for j in range(i,len(code)):
  if code[j]=='(':level+=1
  elif code[j]==')':
   level-=1
   if level==0:return code[start:j+1]+' else failures++;'
cases={
 '001':(['signal_a'],[(x,) for x in [0,1,0,0,1,1,0,0,1,1,1,1,1,1,1,1,0,0]],2),
 '004':(['valid_request','grant'],[(0,0),(1,0),(0,1),(0,0),(0,0),(0,0),(0,0),(0,0),(0,0),(1,0),(0,0),(0,0),(0,1),(0,0),(0,0),(0,0)],1),
 '007':(['signal_a'],[(x,) for x in [0,1,1,0,0,1,0,0]],1),
 '022':(['a','b','c','d'],[(0,0,0,0),(1,0,0,0),(0,0,0,0),(0,1,0,0),(0,0,0,0),(0,0,0,0),(0,0,0,0),(1,0,0,0),(0,0,0,0),(0,0,1,0),(0,0,0,0)],1)
}
for num,(signals,trace,expected) in cases.items():
 code=re.findall(r'```systemverilog\n(.*?)```',qs['sva-scen-'+num],re.S)[0]
 assertion=first_assert(code)
 lines=['`timescale 1ns/1ps','module tb;','bit clk=0; always #5 clk=~clk;','logic rst_n=0;','logic '+','.join(signals)+';','int failures=0;',assertion,'initial begin',"{"+','.join(signals)+"}='0;",'repeat(2) @(negedge clk); rst_n=1;']
 for sample in trace:lines+=['@(negedge clk); {'+','.join(signals)+'} = '+str(len(signals))+"'b"+''.join(map(str,sample))+';']
 lines+=['repeat(8) @(negedge clk);',f'if(failures!={expected}) $fatal(1,"expected {expected} assertion failures, got %0d",failures);',f'$display("PASS sva-scen-{num}: detected {expected} intentional failure(s)");','$finish;','end','endmodule']
 work=root/num;work.mkdir(exist_ok=True);(work/'tb.sv').write_text('\n'.join(lines))

for work in sorted(root.iterdir()):
 if not work.is_dir():continue
 r=subprocess.run(['vcs','-full64','-sverilog','-assert','svaext','tb.sv','-o','simv'],cwd=work,capture_output=True,text=True)
 (work/'compile.log').write_text(r.stdout+r.stderr)
 if r.returncode:raise RuntimeError(str(work)+' compile failed')
 r=subprocess.run(['./simv'],cwd=work,capture_output=True,text=True,timeout=20)
 (work/'sim.log').write_text(r.stdout+r.stderr)
 print(r.stdout,flush=True)
 if r.returncode or 'PASS sva-scen-' not in r.stdout:raise RuntimeError(str(work)+' simulation failed')
