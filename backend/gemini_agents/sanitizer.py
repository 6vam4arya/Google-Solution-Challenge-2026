"""
Security sanitizer for prompt injection protection
"""

class PromptInjectionError(Exception):
    """Raised when potential prompt injection is detected"""
    pass


INJECTION_BLACKLIST = [
    "ignore previous instructions",
    "ignore all previous prompts",
    "forget all previous instructions",
    "delete database",
    "drop table",
    "reveal prompt",
    "system prompt",
    "you are a",
    "act as",
    "pretend you are",
    "roleplay as",
    "ignore the above",
    "system:",
    "admin:",
    "root:",
]


def sanitize_log(log: str, max_length: int = 5000) -> str:
    """
    Sanitize user input to prevent prompt injection attacks
    
    Args:
        log: Raw log input from user
        max_length: Maximum allowed length
        
    Returns:
        Sanitized log string
        
    Raises:
        PromptInjectionError: If potential injection detected
    """
    if not log:
        return ""
    
    # Check length
    if len(log) > max_length:
        log = log[:max_length]
    
    # Check for injection patterns
    log_lower = log.lower().strip()
    
    for blacklisted in INJECTION_BLACKLIST:
        if blacklisted in log_lower:
            raise PromptInjectionError(
                f"Potential prompt injection detected: '{blacklisted}' found in input"
            )
    
    return log


def sanitize_prompt(prompt: str) -> str:
    """
    Additional sanitization for constructed prompts
    
    Args:
        prompt: Prompt to sanitize
        
    Returns:
        Sanitized prompt
    """
    # Remove potentially dangerous characters but keep log content intact
    prompt = prompt.replace("```", "")  # Prevent code block injection
    return prompt
