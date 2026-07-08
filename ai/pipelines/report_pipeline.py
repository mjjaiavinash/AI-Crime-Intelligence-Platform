from ai.groq.client import GroqClientManager
from ai.prompts.templates import CASE_SUMMARY_PROMPT, TIMELINE_PROMPT, RISK_ANALYSIS_PROMPT
from core.logging import get_logger

logger = get_logger(__name__)


def generate_case_summary(case_data: str) -> str:
    """Generate structured case executive summary using Groq Llama-3 model."""
    prompt = CASE_SUMMARY_PROMPT.format(case_data=case_data)
    system_prompt = "You are a senior criminal investigator and intelligence officer."
    logger.info("Generating AI case summary...")
    return GroqClientManager.generate_completion(prompt, system_prompt=system_prompt)


def generate_timeline(log_data: str) -> str:
    """Generate structured chronological event timeline."""
    prompt = TIMELINE_PROMPT.format(log_data=log_data)
    system_prompt = "You are a detail-oriented crime analyst extracting timelines."
    logger.info("Generating AI event timeline...")
    return GroqClientManager.generate_completion(prompt, system_prompt=system_prompt)


def generate_risk_analysis(suspect_data: str) -> str:
    """Generate recidivism risk scoring and threat explanations."""
    prompt = RISK_ANALYSIS_PROMPT.format(suspect_data=suspect_data)
    system_prompt = "You are a forensic behavioral profiling expert."
    logger.info("Generating AI suspect risk analysis...")
    return GroqClientManager.generate_completion(prompt, system_prompt=system_prompt)
