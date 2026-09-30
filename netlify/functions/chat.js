const knowledge = `
Name: Harish Raja.

Education:
- AI/ML-focused academic background.

Training:
- 3-month Machine Learning training at Oriana Academy, Chennai.

Skills:
- Python
- Machine Learning
- Data Analysis
- SQL
- Pandas
- NumPy
- TensorFlow
- Git/GitHub

Projects:
- Spotify Subscriber Prediction: machine learning project using survey data to explore and predict subscriber behavior.
- LSTM & GRU: deep learning project exploring recurrent neural networks and sequence learning.

Experience:
- Previous hands-on experience at JS Automation with CNC programming, circuit design and implementation.

Career interests:
- AI/ML
- Data Analytics
- Data Science
- Deep Learning
- Python
- Practical portfolio projects

Contact:
- Email: harishraja.41104@gmail.com
- GitHub: https://github.com/HarishrajaK04
- LinkedIn: https://www.linkedin.com/in/harish-raja-4367ab246/
`;

exports.handler = async function(event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        answer: "Method not allowed."
      })
    };
  }

  try {

    const { question } = JSON.parse(event.body || "{}");

    if (!question || !question.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          answer: "Please ask a question about Harish."
        })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing from Netlify.");
    }

    const model = "gemini-3.5-flash";

    const prompt = `
You are the personal portfolio chatbot for Harish Raja.

Answer ONLY questions about Harish.

Rules:
1. Use ONLY the knowledge base below.
2. Never invent information.
3. If the question is unrelated to Harish, reply exactly:
"I can only answer questions about Harish."
4. If the question is about Harish but the information isn't available, say:
"The information is not currently listed in Harish's portfolio."
5. Keep answers concise and natural.

KNOWLEDGE BASE:
${knowledge}

USER QUESTION:
${question}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      }
    );

    const responseText = await response.text();

    if (!response.ok) {

      console.error(
        "Gemini API error:",
        response.status,
        responseText
      );

      return {
        statusCode: 500,
        body: JSON.stringify({
          answer: `Gemini API error (${response.status}). Check the Netlify function logs.`
        })
      };
    }

    const data = JSON.parse(responseText);

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      console.error("Unexpected Gemini response:", responseText);

      return {
        statusCode: 500,
        body: JSON.stringify({
          answer: "Gemini returned an empty response."
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer: answer
      })
    };

  } catch (error) {

    console.error("Chat function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        answer: "Chatbot error. Check the Netlify function logs."
      })
    };
  }
};
