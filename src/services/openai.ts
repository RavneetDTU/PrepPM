export async function speakQuestion(text: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'tts-1', voice: 'nova', input: text })
  });
  if (!response.ok) throw new Error('Speech synthesis failed. Check your API key.');
  const blob = await response.blob();
  const audio = new Audio(URL.createObjectURL(blob));
  await audio.play();
  return audio;
}

export async function transcribeAudio(audioBlob: Blob, apiKey: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.webm');
  formData.append('model', 'whisper-1');
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: formData
  });
  if (!response.ok) throw new Error('Transcription failed. Check your API key.');
  const data = await response.json();
  return data.text;
}

export async function getAIFeedback(question: string, transcript: string, company: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: `You are an expert PM interview coach who has hired at ${company}. 
          Evaluate the candidate's answer to a PM interview question.
          Return ONLY valid JSON in this exact format:
          {
            "score": <0-100>,
            "good": ["thing done well 1", "thing done well 2"],
            "improve": ["thing to add 1", "thing to add 2"],
            "missing": ["critical missing element"],
            "dimension_scores": {
              "structure": <0-100>,
              "user_empathy": <0-100>,
              "metrics": <0-100>,
              "prioritization": <0-100>,
              "communication": <0-100>
            },
            "summary": "2-sentence summary of performance"
          }`
        },
        {
          role: 'user',
          content: `Question: ${question}\n\nCandidate's answer: ${transcript}`
        }
      ]
    })
  });
  if (!response.ok) throw new Error('AI evaluation failed. Check your API key.');
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
