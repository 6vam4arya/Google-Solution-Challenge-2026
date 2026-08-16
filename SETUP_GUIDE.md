# Gemini Integration Setup Guide

This guide will help you set up the Gemini AI integration for the Security Analysis System.

## Prerequisites

- Python 3.10+
- Node.js 18+
- A Google Gemini API key ([Get one here](https://ai.google.dev/))

## Backend Setup

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key

### 2. Install Backend Dependencies

```bash
# From project root
cd backend
pip install -r requirements.txt
```

### 3. Configure Environment Variables

```bash
# Create .env file in project root
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start the Backend Server

```bash
cd backend
python main.py
```

The server should start on `http://localhost:8000`

To verify it's running:
```bash
curl http://localhost:8000/health
```

## Frontend Setup

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Add to your `.env` or `.env.local`:
```
VITE_API_BASE_URL=http://localhost:8000
```

### 3. Start the Frontend Dev Server

```bash
npm run dev
```

The frontend should be available at `http://localhost:5173`

## Architecture

### 6 Specialized Agents

Each agent specializes in a different security domain:

1. **Sentinel-α (A-01)** - Malware Detection
   - Trojans, worms, rootkits, malicious executables
   
2. **Oracle-β (A-02)** - Injection Attacks
   - SQL injection, command injection, NoSQL injection
   
3. **Cipher-γ (A-03)** - Network Attacks
   - DDoS, port scanning, traffic anomalies
   
4. **Warden-δ (A-04)** - Authentication Attacks
   - Brute force, credential stuffing, privilege escalation
   
5. **Echo-ε (A-05)** - Insider Threats
   - Data exfiltration, unauthorized access patterns
   
6. **Nexus-η (A-06)** - Compliance & Vulnerabilities
   - CVE exploitation, compliance violations, weak crypto

### Data Flow

```
Frontend (React)
    ↓
GeminiClient (/analyze)
    ↓
FastAPI Backend
    ↓
AgentPool (all 6 agents)
    ↓
Gemini API (6 parallel calls)
    ↓
Consensus Engine (BFT voting)
    ↓
Return: Consensus Score + Individual Votes
```

### Consensus Algorithm

- **BFT (Byzantine Fault Tolerant)** quorum
- **Threshold**: >2/3 majority needed for consensus
- **Verdicts**: BLOCK (threat), ALLOW (safe), REVIEW (no consensus)

## API Endpoints

### Analysis Endpoints

**POST /analyze** - Full consensus analysis
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"log":"your_security_log_here"}'
```

**POST /analyze/agent/{agent_id}** - Single agent analysis
```bash
curl -X POST http://localhost:8000/analyze/agent/A-01 \
  -H "Content-Type: application/json" \
  -d '{"log":"your_security_log_here"}'
```

### Info Endpoints

**GET /health** - Health check
```bash
curl http://localhost:8000/health
```

**GET /agents** - List all agents
```bash
curl http://localhost:8000/agents
```

**GET /config** - Get configuration
```bash
curl http://localhost:8000/config
```

## File Structure

```
.
├── backend/
│   ├── main.py                          # FastAPI app
│   ├── requirements.txt                 # Python dependencies
│   └── gemini_agents/
│       ├── __init__.py
│       ├── base_agent.py               # Base class for all agents
│       ├── agent_pool.py               # Agent manager
│       ├── sanitizer.py                # Input validation
│       ├── malware_agent.py            # Agent A-01
│       ├── injection_agent.py          # Agent A-02
│       ├── network_agent.py            # Agent A-03
│       ├── auth_agent.py               # Agent A-04
│       ├── insider_agent.py            # Agent A-05
│       └── compliance_agent.py         # Agent A-06
│
├── src/
│   ├── lib/
│   │   └── gemini-client.ts            # API client
│   ├── hooks/
│   │   └── useGeminiAnalysis.ts       # React hook
│   └── pages/
│       └── Triage.tsx                  # Updated UI component
│
├── .env.example
├── SETUP_GUIDE.md
└── ...
```

## Security Features

### Prompt Injection Protection

All user input is sanitized before reaching Gemini:
- Blacklist of dangerous keywords
- Length validation
- Special character filtering

### Retry Logic

- Automatic retry with exponential backoff
- Up to 3 attempts per request
- Timeout handling

### Input Validation

- Maximum log length: 5000 characters
- Empty log rejection
- Malformed JSON handling

## Troubleshooting

### Backend won't start

**Error**: `GEMINI_API_KEY environment variable not set`
- Make sure you've created `.env` file with your API key
- Verify the key is valid at [Google AI Studio](https://ai.google.dev/)

### CORS errors

**Error**: `Access to XMLHttpRequest has been blocked by CORS policy`
- Make sure backend is running on port 8000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Verify backend CORS configuration in `backend/main.py`

### Gemini API errors

**Error**: `Failed to reach Gemini API`
- Check your internet connection
- Verify API key is active
- Check [Google AI status](https://status.ai.google.dev/)
- Review Gemini API [documentation](https://ai.google.dev/docs)

### Frontend can't reach backend

**Error**: `Network error` or `Failed to reach Gemini API`
- Make sure backend is running: `python backend/main.py`
- Check backend is on `http://localhost:8000`
- Try `curl http://localhost:8000/health` to verify

## Example Usage

### In React Component

```typescript
import { useGeminiAnalysis } from '@/hooks/useGeminiAnalysis';

function MyComponent() {
  const { analyze, result, loading, error } = useGeminiAnalysis();

  const handleAnalyze = async () => {
    await analyze(logInput);
  };

  if (loading) return <div>Analyzing...</div>;
  if (error) return <div>Error: {error}</div>;
  if (result) {
    return (
      <div>
        <h2>Consensus Score: {result.consensus_score}</h2>
        <p>Verdict: {result.final_verdict}</p>
        {result.votes.map(vote => (
          <div key={vote.id}>
            {vote.name}: {vote.decision ? 'THREAT' : 'SAFE'}
          </div>
        ))}
      </div>
    );
  }

  return <button onClick={handleAnalyze}>Analyze</button>;
}
```

## Performance Tips

1. **Parallel Agent Analysis**: In production, use `asyncio` for true parallelism
2. **Caching**: Cache repetitive analysis results
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Batch Analysis**: Analyze multiple logs in one request (future feature)

## Next Steps

1. Update `src/pages/Triage.tsx` to use `useGeminiAnalysis` hook
2. Add real-time agent status dashboard
3. Implement audit logging for all analyses
4. Add support for custom agent prompts
5. Implement analysis history and trending

## Support

For issues with:
- **Gemini API**: Visit [Google AI Documentation](https://ai.google.dev/docs)
- **FastAPI**: See [FastAPI Docs](https://fastapi.tiangolo.com/)
- **React**: See [React Docs](https://react.dev/)
