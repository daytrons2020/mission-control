#!/usr/bin/env python3
"""Fibonacci number calculator with multiple implementations."""

from functools import lru_cache


def fibonacci_recursive(n: int) -> int:
    """
    Calculate the nth Fibonacci number using recursion.
    
    Args:
        n: The position in the Fibonacci sequence (0-indexed)
        
    Returns:
        The nth Fibonacci number
        
    Note: This is simple but inefficient for large n (O(2^n)).
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    return fibonacci_recursive(n - 1) + fibonacci_recursive(n - 2)


def fibonacci_iterative(n: int) -> int:
    """
    Calculate the nth Fibonacci number using iteration.
    
    Args:
        n: The position in the Fibonacci sequence (0-indexed)
        
    Returns:
        The nth Fibonacci number
        
    Note: O(n) time, O(1) space - efficient and practical.
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b


@lru_cache(maxsize=None)
def fibonacci_memoized(n: int) -> int:
    """
    Calculate the nth Fibonacci number using memoization.
    
    Args:
        n: The position in the Fibonacci sequence (0-indexed)
        
    Returns:
        The nth Fibonacci number
        
    Note: O(n) time with caching - great for repeated calls.
    """
    if n < 0:
        raise ValueError("n must be non-negative")
    if n <= 1:
        return n
    return fibonacci_memoized(n - 1) + fibonacci_memoized(n - 2)


def fibonacci_sequence(count: int) -> list[int]:
    """
    Generate a list of the first 'count' Fibonacci numbers.
    
    Args:
        count: How many Fibonacci numbers to generate
        
    Returns:
        List of Fibonacci numbers [F(0), F(1), ..., F(count-1)]
    """
    if count < 0:
        raise ValueError("count must be non-negative")
    if count == 0:
        return []
    
    sequence = [0]
    if count == 1:
        return sequence
    
    sequence.append(1)
    for i in range(2, count):
        sequence.append(sequence[i - 1] + sequence[i - 2])
    
    return sequence


# Default function for convenience
fibonacci = fibonacci_iterative


if __name__ == "__main__":
    # Demo
    print("First 20 Fibonacci numbers:")
    print(fibonacci_sequence(20))
    
    print("\nIndividual calculations:")
    for i in [0, 1, 10, 20, 30]:
        print(f"F({i}) = {fibonacci(i)}")
