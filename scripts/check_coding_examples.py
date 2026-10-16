#!/usr/bin/env python3
"""Execute examples and edge cases against the Python solutions shipped in the bank.

Generated test cases by Gemini via agy; adapted by Codex to read the actual JSON.
"""
import json
import re
from pathlib import Path
from typing import List, Optional

ROOT = Path(__file__).resolve().parents[1]
all_solutions = json.loads((ROOT / "data/solutions/gemini-coding.json").read_text())
assert set(all_solutions) == {f"hwinterview-{n:03d}" for n in range(76, 104)}

# Extract Python code and run unit tests
FENCE_RE = re.compile(r"```python\s*\n(.*?)```", re.S)

def extract_code(q_id: str) -> str:
    md = all_solutions[q_id]
    matches = FENCE_RE.findall(md)
    assert len(matches) >= 1, f"No python code block found in {q_id}"
    return matches[0]

# ---------------------------------------------------------------------------
# TEST SUITE
# ---------------------------------------------------------------------------
test_results = []

def run_test(name, fn):
    try:
        fn()
        test_results.append((name, "PASS", ""))
        print(f"  [PASS] {name}")
    except Exception as e:
        test_results.append((name, "FAIL", str(e)))
        print(f"  [FAIL] {name}: {e}")
        raise

print("\n--- Running Tests for All 28 Solutions ---")

# hwinterview-076: LeetCode #318
code_076 = extract_code("hwinterview-076")
env_076 = {}
exec(code_076, env_076)
sol_076 = env_076["Solution"]()

def test_076():
    # Example 1
    assert sol_076.maxProduct(["abcw","baz","foo","bar","xtfn","abcdef"]) == 16
    # Example 2
    assert sol_076.maxProduct(["a","ab","abc","d","cd","bcd","abcd"]) == 4
    # Example 3 (all share 'a')
    assert sol_076.maxProduct(["a","aa","aaa","aaaa"]) == 0
    # Edge case: duplicate masks
    assert sol_076.maxProduct(["ab", "aabb", "cd", "ccdd"]) == 16
    # Edge case: single word
    assert sol_076.maxProduct(["single"]) == 0
run_test("hwinterview-076: #318 Maximum Product of Word Lengths", test_076)

# hwinterview-077: LeetCode #476
code_077 = extract_code("hwinterview-077")
env_077 = {}
exec(code_077, env_077)
sol_077 = env_077["Solution"]()

def test_077():
    assert sol_077.findComplement(5) == 2
    assert sol_077.findComplement(1) == 0
    assert sol_077.findComplement(8) == 7
    assert sol_077.findComplement(7) == 0
    assert sol_077.findComplement(2147483647) == 0
run_test("hwinterview-077: #476 Number Complement", test_077)

# hwinterview-078: LeetCode #1
code_078 = extract_code("hwinterview-078")
env_078 = {}
exec(code_078, env_078)
sol_078 = env_078["Solution"]()

def test_078():
    assert sol_078.twoSum([2, 7, 11, 15], 9) == [0, 1]
    assert sol_078.twoSum([3, 2, 4], 6) == [1, 2]
    assert sol_078.twoSum([3, 3], 6) == [0, 1]
    assert sol_078.twoSum([-1, -2, -3, -4, -5], -8) == [2, 4]
run_test("hwinterview-078: #1 Two Sum", test_078)

# hwinterview-079: LeetCode #26
code_079 = extract_code("hwinterview-079")
env_079 = {}
exec(code_079, env_079)
sol_079 = env_079["Solution"]()

def test_079():
    nums1 = [1, 1, 2]
    k1 = sol_079.removeDuplicates(nums1)
    assert k1 == 2 and nums1[:k1] == [1, 2]

    nums2 = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]
    k2 = sol_079.removeDuplicates(nums2)
    assert k2 == 5 and nums2[:k2] == [0, 1, 2, 3, 4]

    nums3 = [1]
    k3 = sol_079.removeDuplicates(nums3)
    assert k3 == 1 and nums3[:k3] == [1]

    nums4 = [1, 1, 1, 1]
    k4 = sol_079.removeDuplicates(nums4)
    assert k4 == 1 and nums4[:k4] == [1]
run_test("hwinterview-079: #26 Remove Duplicates from Sorted Array", test_079)

# hwinterview-080: LeetCode #27
code_080 = extract_code("hwinterview-080")
env_080 = {}
exec(code_080, env_080)
sol_080 = env_080["Solution"]()

def test_080():
    nums1 = [3, 2, 2, 3]
    k1 = sol_080.removeElement(nums1, 3)
    assert k1 == 2 and sorted(nums1[:k1]) == [2, 2]

    nums2 = [0, 1, 2, 2, 3, 0, 4, 2]
    k2 = sol_080.removeElement(nums2, 2)
    assert k2 == 5 and sorted(nums2[:k2]) == [0, 0, 1, 3, 4]

    nums3 = []
    assert sol_080.removeElement(nums3, 1) == 0

    nums4 = [2, 2, 2]
    assert sol_080.removeElement(nums4, 2) == 0
run_test("hwinterview-080: #27 Remove Element", test_080)

# hwinterview-081: LeetCode #88
code_081 = extract_code("hwinterview-081")
env_081 = {}
exec(code_081, env_081)
sol_081 = env_081["Solution"]()

def test_081():
    nums1 = [1, 2, 3, 0, 0, 0]
    sol_081.merge(nums1, 3, [2, 5, 6], 3)
    assert nums1 == [1, 2, 2, 3, 5, 6]

    nums1 = [1]
    sol_081.merge(nums1, 1, [], 0)
    assert nums1 == [1]

    nums1 = [0]
    sol_081.merge(nums1, 0, [1], 1)
    assert nums1 == [1]

    # nums1 exhausted first with m > 0: leftover nums2 must still be copied
    nums1 = [4, 5, 6, 0, 0, 0]
    sol_081.merge(nums1, 3, [1, 2, 3], 3)
    assert nums1 == [1, 2, 3, 4, 5, 6]
run_test("hwinterview-081: #88 Merge Sorted Array", test_081)

# hwinterview-082: LeetCode #169
code_082 = extract_code("hwinterview-082")
env_082 = {}
exec(code_082, env_082)
sol_082 = env_082["Solution"]()

def test_082():
    assert sol_082.majorityElement([3, 2, 3]) == 3
    assert sol_082.majorityElement([2, 2, 1, 1, 1, 2, 2]) == 2
    assert sol_082.majorityElement([1]) == 1
    assert sol_082.majorityElement([-1, -1, 2147483647, -1]) == -1
run_test("hwinterview-082: #169 Majority Element", test_082)

# hwinterview-083: LeetCode #242
code_083 = extract_code("hwinterview-083")
env_083 = {}
exec(code_083, env_083)
sol_083 = env_083["Solution"]()

def test_083():
    assert sol_083.isAnagram("anagram", "nagaram") is True
    assert sol_083.isAnagram("rat", "car") is False
    assert sol_083.isAnagram("a", "ab") is False
    assert sol_083.isAnagram("ab", "a") is False
    assert sol_083.isAnagram("a", "a") is True
run_test("hwinterview-083: #242 Valid Anagram", test_083)

# hwinterview-084: LeetCode #15
code_084 = extract_code("hwinterview-084")
env_084 = {}
exec(code_084, env_084)
sol_084 = env_084["Solution"]()

def test_084():
    res1 = sol_084.threeSum([-1, 0, 1, 2, -1, -4])
    norm1 = sorted([sorted(x) for x in res1])
    assert norm1 == [[-1, -1, 2], [-1, 0, 1]]

    assert sol_084.threeSum([0, 1, 1]) == []
    assert sol_084.threeSum([0, 0, 0]) == [[0, 0, 0]]
    assert sol_084.threeSum([0, 0, 0, 0]) == [[0, 0, 0]]
run_test("hwinterview-084: #15 3Sum", test_084)

# hwinterview-085: LeetCode #54
code_085 = extract_code("hwinterview-085")
env_085 = {}
exec(code_085, env_085)
sol_085 = env_085["Solution"]()

def test_085():
    assert sol_085.spiralOrder([[1,2,3],[4,5,6],[7,8,9]]) == [1,2,3,6,9,8,7,4,5]
    assert sol_085.spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]]) == [1,2,3,4,8,12,11,10,9,5,6,7]
    assert sol_085.spiralOrder([[1]]) == [1]
    assert sol_085.spiralOrder([[1,2,3]]) == [1,2,3]
    assert sol_085.spiralOrder([[1],[2],[3]]) == [1,2,3]
run_test("hwinterview-085: #54 Spiral Matrix", test_085)

# hwinterview-086: LeetCode #13
code_086 = extract_code("hwinterview-086")
env_086 = {}
exec(code_086, env_086)
sol_086 = env_086["Solution"]()

def test_086():
    assert sol_086.romanToInt("III") == 3
    assert sol_086.romanToInt("LVIII") == 58
    assert sol_086.romanToInt("MCMXCIV") == 1994
    assert sol_086.romanToInt("IV") == 4
    assert sol_086.romanToInt("IX") == 9
    assert sol_086.romanToInt("XL") == 40
    assert sol_086.romanToInt("XC") == 90
    assert sol_086.romanToInt("CD") == 400
    assert sol_086.romanToInt("CM") == 900
run_test("hwinterview-086: #13 Roman to Integer", test_086)

# hwinterview-087: LeetCode #20
code_087 = extract_code("hwinterview-087")
env_087 = {}
exec(code_087, env_087)
sol_087 = env_087["Solution"]()

def test_087():
    assert sol_087.isValid("()") is True
    assert sol_087.isValid("()[]{}") is True
    assert sol_087.isValid("(]") is False
    assert sol_087.isValid("([)]") is False
    assert sol_087.isValid("{[]}") is True
    assert sol_087.isValid("]") is False
    assert sol_087.isValid("((") is False
    assert sol_087.isValid("") is True
run_test("hwinterview-087: #20 Valid Parentheses", test_087)

# Helper for linked lists
def build_ll(vals):
    if not vals:
        return None
    # We will use the ListNode defined in the environment
    ListNode = env_088["ListNode"]
    dummy = ListNode(0)
    curr = dummy
    for v in vals:
        curr.next = ListNode(v)
        curr = curr.next
    return dummy.next

def ll_to_list(head):
    res = []
    curr = head
    while curr:
        res.append(curr.val)
        curr = curr.next
    return res

# hwinterview-088: LeetCode #21
code_088 = extract_code("hwinterview-088")
env_088 = {}
exec(code_088, env_088)
sol_088 = env_088["Solution"]()

def test_088():
    l1 = build_ll([1, 2, 4])
    l2 = build_ll([1, 3, 4])
    merged = sol_088.mergeTwoLists(l1, l2)
    assert ll_to_list(merged) == [1, 1, 2, 3, 4, 4]

    assert sol_088.mergeTwoLists(None, None) is None
    assert ll_to_list(sol_088.mergeTwoLists(None, build_ll([0]))) == [0]
run_test("hwinterview-088: #21 Merge Two Sorted Lists", test_088)

# hwinterview-089: LeetCode #83
code_089 = extract_code("hwinterview-089")
env_089 = {}
exec(code_089, env_089)
sol_089 = env_089["Solution"]()

def test_089():
    l1 = build_ll([1, 1, 2])
    assert ll_to_list(sol_089.deleteDuplicates(l1)) == [1, 2]

    l2 = build_ll([1, 1, 2, 3, 3])
    assert ll_to_list(sol_089.deleteDuplicates(l2)) == [1, 2, 3]

    assert sol_089.deleteDuplicates(None) is None
    l3 = build_ll([1, 1, 1, 1])
    assert ll_to_list(sol_089.deleteDuplicates(l3)) == [1]
run_test("hwinterview-089: #83 Remove Duplicates from Sorted List", test_089)

# hwinterview-090: LeetCode #141
code_090 = extract_code("hwinterview-090")
env_090 = {}
exec(code_090, env_090)
sol_090 = env_090["Solution"]()

def test_090():
    ListNode = env_090["ListNode"]
    # Cycle test
    n1, n2, n3, n4 = ListNode(3), ListNode(2), ListNode(0), ListNode(-4)
    n1.next = n2; n2.next = n3; n3.next = n4; n4.next = n2
    assert sol_090.hasCycle(n1) is True

    # No cycle test
    m1, m2 = ListNode(1), ListNode(2)
    m1.next = m2
    assert sol_090.hasCycle(m1) is False

    # Single node no cycle
    assert sol_090.hasCycle(ListNode(1)) is False

    # Single node self cycle
    s1 = ListNode(1)
    s1.next = s1
    assert sol_090.hasCycle(s1) is True

    # Empty
    assert sol_090.hasCycle(None) is False
run_test("hwinterview-090: #141 Linked List Cycle", test_090)

# hwinterview-091: LeetCode #160
code_091 = extract_code("hwinterview-091")
env_091 = {}
exec(code_091, env_091)
sol_091 = env_091["Solution"]()

def test_091():
    ListNode = env_091["ListNode"]
    # Shared tail: 8 -> 4 -> 5
    c1, c2, c3 = ListNode(8), ListNode(4), ListNode(5)
    c1.next = c2; c2.next = c3
    # List A: 4 -> 1 -> c1
    a1, a2 = ListNode(4), ListNode(1)
    a1.next = a2; a2.next = c1
    # List B: 5 -> 6 -> 1 -> c1
    b1, b2, b3 = ListNode(5), ListNode(6), ListNode(1)
    b1.next = b2; b2.next = b3; b3.next = c1

    assert sol_091.getIntersectionNode(a1, b1) is c1

    # Disjoint lists
    d1, d2 = ListNode(2), ListNode(3)
    assert sol_091.getIntersectionNode(d1, d2) is None

    # Disjoint lists of different lengths (needs both redirects, ends at None)
    e1, e2, e3 = ListNode(1), ListNode(2), ListNode(3)
    e1.next = e2; e2.next = e3
    assert sol_091.getIntersectionNode(e1, ListNode(9)) is None

    # Intersection at the head of one list
    assert sol_091.getIntersectionNode(c1, a1) is c1
run_test("hwinterview-091: #160 Intersection of Two Linked Lists", test_091)

# hwinterview-092: LeetCode #206
code_092 = extract_code("hwinterview-092")
env_092 = {}
exec(code_092, env_092)
sol_092 = env_092["Solution"]()

def test_092():
    l1 = build_ll([1, 2, 3, 4, 5])
    rev1 = sol_092.reverseList(l1)
    assert ll_to_list(rev1) == [5, 4, 3, 2, 1]

    assert sol_092.reverseList(None) is None
    l2 = build_ll([1, 2])
    assert ll_to_list(sol_092.reverseList(l2)) == [2, 1]
run_test("hwinterview-092: #206 Reverse Linked List", test_092)

# hwinterview-093: LeetCode #125
code_093 = extract_code("hwinterview-093")
env_093 = {}
exec(code_093, env_093)
sol_093 = env_093["Solution"]()

def test_093():
    assert sol_093.isPalindrome("A man, a plan, a canal: Panama") is True
    assert sol_093.isPalindrome("race a car") is False
    assert sol_093.isPalindrome(" ") is True
    assert sol_093.isPalindrome("0P") is False
run_test("hwinterview-093: #125 Valid Palindrome", test_093)

# hwinterview-094: LeetCode #167
code_094 = extract_code("hwinterview-094")
env_094 = {}
exec(code_094, env_094)
sol_094 = env_094["Solution"]()

def test_094():
    assert sol_094.twoSum([2, 7, 11, 15], 9) == [1, 2]
    assert sol_094.twoSum([2, 3, 4], 6) == [1, 3]
    assert sol_094.twoSum([-1, 0], -1) == [1, 2]
    assert sol_094.twoSum([0, 0, 3, 4], 0) == [1, 2]
run_test("hwinterview-094: #167 Two Sum II - Input Array Is Sorted", test_094)

# hwinterview-095: LeetCode #704
code_095 = extract_code("hwinterview-095")
env_095 = {}
exec(code_095, env_095)
sol_095 = env_095["Solution"]()

def test_095():
    assert sol_095.search([-1, 0, 3, 5, 9, 12], 9) == 4
    assert sol_095.search([-1, 0, 3, 5, 9, 12], 2) == -1
    assert sol_095.search([5], 5) == 0
    assert sol_095.search([5], -5) == -1
run_test("hwinterview-095: #704 Binary Search", test_095)

# hwinterview-096: LeetCode #35
code_096 = extract_code("hwinterview-096")
env_096 = {}
exec(code_096, env_096)
sol_096 = env_096["Solution"]()

def test_096():
    assert sol_096.searchInsert([1, 3, 5, 6], 5) == 2
    assert sol_096.searchInsert([1, 3, 5, 6], 2) == 1
    assert sol_096.searchInsert([1, 3, 5, 6], 7) == 4
    assert sol_096.searchInsert([1, 3, 5, 6], 0) == 0
run_test("hwinterview-096: #35 Search Insert Position", test_096)

# hwinterview-097: LeetCode #155
code_097 = extract_code("hwinterview-097")
env_097 = {}
exec(code_097, env_097)

def test_097():
    MinStack = env_097["MinStack"]
    ms = MinStack()
    ms.push(-2)
    ms.push(0)
    ms.push(-3)
    assert ms.getMin() == -3
    ms.pop()
    assert ms.top() == 0
    assert ms.getMin() == -2

    # Duplicate minimums test
    ms2 = MinStack()
    ms2.push(2)
    ms2.push(2)
    assert ms2.getMin() == 2
    ms2.pop()
    assert ms2.getMin() == 2
run_test("hwinterview-097: #155 Min Stack", test_097)

# hwinterview-098: LeetCode #225
code_098 = extract_code("hwinterview-098")
env_098 = {}
exec(code_098, env_098)

def test_098():
    MyStack = env_098["MyStack"]
    st = MyStack()
    st.push(1)
    st.push(2)
    assert st.top() == 2
    assert st.pop() == 2
    assert st.empty() is False
    assert st.pop() == 1
    assert st.empty() is True

    # Three or more elements, interleaved (catches wrong rotation counts)
    st.push(1); st.push(2); st.push(3)
    assert st.pop() == 3
    st.push(4)
    assert st.top() == 4
    assert [st.pop(), st.pop(), st.pop()] == [4, 2, 1]
    assert st.empty() is True
run_test("hwinterview-098: #225 Implement Stack using Queues", test_098)

# hwinterview-099: LeetCode #232
code_099 = extract_code("hwinterview-099")
env_099 = {}
exec(code_099, env_099)

def test_099():
    MyQueue = env_099["MyQueue"]
    q = MyQueue()
    q.push(1)
    q.push(2)
    assert q.peek() == 1
    assert q.pop() == 1
    assert q.empty() is False
    assert q.pop() == 2
    assert q.empty() is True

    # Push while out_stack is non-empty (transfer only when out_stack is empty)
    q.push(1); q.push(2)
    assert q.pop() == 1
    q.push(3)
    assert q.peek() == 2
    assert [q.pop(), q.pop()] == [2, 3]
    assert q.empty() is True
run_test("hwinterview-099: #232 Implement Queue using Stacks", test_099)

# hwinterview-100: LeetCode #705
code_100 = extract_code("hwinterview-100")
env_100 = {}
exec(code_100, env_100)

def test_100():
    MyHashSet = env_100["MyHashSet"]
    hs = MyHashSet()
    hs.add(1)
    hs.add(2)
    assert hs.contains(1) is True
    assert hs.contains(3) is False
    hs.add(2)
    assert hs.contains(2) is True
    hs.remove(2)
    assert hs.contains(2) is False

    # Collision test (1 and 1 + 769 = 770)
    hs.add(1)
    hs.add(770)
    assert hs.contains(1) is True
    assert hs.contains(770) is True
    hs.remove(1)
    assert hs.contains(1) is False
    assert hs.contains(770) is True

    # Key 0 test
    hs.add(0)
    assert hs.contains(0) is True
    hs.remove(0)
    assert hs.contains(0) is False
run_test("hwinterview-100: #705 Design HashSet", test_100)

# hwinterview-101: LeetCode #706
code_101 = extract_code("hwinterview-101")
env_101 = {}
exec(code_101, env_101)

def test_101():
    MyHashMap = env_101["MyHashMap"]
    hm = MyHashMap()
    hm.put(1, 1)
    hm.put(2, 2)
    assert hm.get(1) == 1
    assert hm.get(3) == -1
    hm.put(2, 1)  # Update
    assert hm.get(2) == 1
    hm.remove(2)
    assert hm.get(2) == -1

    # Collision test (1 and 770)
    hm.put(1, 100)
    hm.put(770, 200)
    assert hm.get(1) == 100
    assert hm.get(770) == 200
    hm.remove(1)
    assert hm.get(1) == -1
    assert hm.get(770) == 200

    # Key 0 and val 0
    hm.put(0, 0)
    assert hm.get(0) == 0
    hm.remove(0)
    assert hm.get(0) == -1
run_test("hwinterview-101: #706 Design HashMap", test_101)

# hwinterview-102: LeetCode #146
code_102 = extract_code("hwinterview-102")
env_102 = {}
exec(code_102, env_102)

def test_102():
    LRUCache = env_102["LRUCache"]
    cache = LRUCache(2)
    cache.put(1, 1)
    cache.put(2, 2)
    assert cache.get(1) == 1
    cache.put(3, 3)  # evicts key 2
    assert cache.get(2) == -1
    cache.put(4, 4)  # evicts key 1
    assert cache.get(1) == -1
    assert cache.get(3) == 3
    assert cache.get(4) == 4

    # Capacity 1 test
    c1 = LRUCache(1)
    c1.put(2, 1)
    assert c1.get(2) == 1
    c1.put(3, 2)
    assert c1.get(2) == -1
    assert c1.get(3) == 2

    # Updating existing key test
    c2 = LRUCache(2)
    c2.put(1, 1)
    c2.put(2, 2)
    c2.put(1, 10) # update key 1
    c2.put(3, 30) # should evict key 2, not key 1
    assert c2.get(1) == 10
    assert c2.get(2) == -1
    assert c2.get(3) == 30
run_test("hwinterview-102: #146 LRU Cache", test_102)

# hwinterview-103: LeetCode #70
code_103 = extract_code("hwinterview-103")
env_103 = {}
exec(code_103, env_103)
sol_103 = env_103["Solution"]()

def test_103():
    assert sol_103.climbStairs(1) == 1
    assert sol_103.climbStairs(2) == 2
    assert sol_103.climbStairs(3) == 3
    assert sol_103.climbStairs(4) == 5
    assert sol_103.climbStairs(5) == 8
    assert sol_103.climbStairs(45) == 1836311903
run_test("hwinterview-103: #70 Climbing Stairs", test_103)

print("\n--- All 28 Tests Passed Successfully! ---")

