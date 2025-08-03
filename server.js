require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const multer = require('multer');
const pdf = require('pdf-parse');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RUTGERS_CS_COURSES = {
  // Computer Science Core
  "01:198:111": { name: "Introduction to Computer Science", credits: 4 },
  "01:198:112": { name: "Data Structures", credits: 4 },
  "01:198:205": { name: "Introduction to Discrete Structures I", credits: 4 },
  "01:198:211": { name: "Computer Architecture", credits: 4 },
  "01:198:344": { name: "Design and Analysis of Computer Algorithms", credits: 4 },
  
  // CS Additional
  "01:198:206": { name: "Introduction to Discrete Structures II", credits: 4 },
  "01:640:477": { name: "Mathematical Theory of Probability", credits: 4 },
  "14:332:226": { name: "Probability and Random Processes", credits: 3 },
  
  // Mathematics
  "01:640:151": { name: "Calculus I for Mathematical and Physical Sciences", credits: 4 },
  "01:640:152": { name: "Calculus II for Mathematical and Physical Sciences", credits: 4 },
  "01:640:250": { name: "Introductory Linear Algebra", credits: 3 },
  
  // Physics
  "01:750:193": { name: "Physics for the Sciences", credits: 4 },
  "01:750:194": { name: "Physics for the Sciences Laboratory", credits: 1 },
  "01:750:271": { name: "Honors Physics I", credits: 3 },
  "01:750:272": { name: "Honors Physics II", credits: 3 },
  "01:750:275": { name: "Honors Physics Laboratory I", credits: 2 },
  "01:750:276": { name: "Honors Physics Laboratory II", credits: 2 },
  "01:750:203": { name: "Physics for the Sciences", credits: 3 },
  "01:750:204": { name: "Physics for the Sciences", credits: 3 },
  "01:750:205": { name: "Physics for the Sciences", credits: 3 },
  "01:750:206": { name: "Physics for the Sciences", credits: 3 },
  "01:750:123": { name: "Physics for the Sciences", credits: 3 },
  "01:750:124": { name: "Physics for the Sciences", credits: 3 },
  "01:750:227": { name: "Physics for the Sciences", credits: 3 },
  "01:750:229": { name: "Physics for the Sciences", credits: 3 },
  
  // Chemistry
  "01:160:159": { name: "General Chemistry", credits: 3 },
  "01:160:160": { name: "General Chemistry", credits: 3 },
  "01:160:171": { name: "General Chemistry Laboratory", credits: 1 },
  "01:160:161": { name: "General Chemistry", credits: 3 },
  "01:160:162": { name: "General Chemistry", credits: 3 },
  
  // SAS Core (simplified)
  "01:090:101": { name: "Expository Writing", credits: 3 },
  "01:090:102": { name: "Research in the Disciplines", credits: 3 },
  "01:070:101": { name: "Introduction to Sociology", credits: 3 },
  "01:050:201": { name: "Introduction to Psychology", credits: 3 },
  "01:082:101": { name: "Introduction to Art History", credits: 3 },
  "01:350:201": { name: "Introduction to Literature", credits: 3 },
  "01:730:101": { name: "Introduction to Philosophy", credits: 3 },
  "01:790:101": { name: "Introduction to Political Science", credits: 3 },
  "01:830:101": { name: "Introduction to Anthropology", credits: 3 },
  "01:840:101": { name: "Introduction to Geography", credits: 3 },
  "01:860:101": { name: "Introduction to Economics", credits: 3 },
  "01:920:101": { name: "Introduction to Statistics", credits: 3 },
  "01:940:101": { name: "Introduction to History", credits: 3 },
  "01:960:101": { name: "Introduction to Mathematics", credits: 3 },
  "01:980:101": { name: "Introduction to Physics", credits: 3 },
  "01:119:101": { name: "Introduction to Biology", credits: 3 },
  "01:160:101": { name: "Introduction to Chemistry", credits: 3 },
};

// PDF parsing endpoint
app.post('/api/parse-pdf', upload.single('transcript'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'File must be a PDF' });
    }

    const data = await pdf(req.file.buffer);
    
    res.json({ text: data.text });
  } catch (error) {
    console.error('PDF parsing error:', error);
    res.status(500).json({ error: 'Failed to parse PDF' });
  }
});

app.post('/api/analyze-transcript', async (req, res) => {
  try {
    const { transcript, completedCourses } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    const prompt = `You are an AI assistant that analyzes university transcripts to identify completed courses. 

Given this transcript text:
"""
${transcript}
"""

Please identify all completed courses that match the Rutgers University course codes in this database:
${JSON.stringify(RUTGERS_CS_COURSES, null, 2)}

Rules:
1. ONLY return courses that have a LETTER GRADE (A, B, C, D, F, A+, B+, etc.) or are marked as "PASSED"
2. DO NOT include courses that have NO GRADE or are marked as "IN PROGRESS" or "CURRENT"
3. Look for course codes in format like "01:198:111" or "01-198-111" or "01 198 111"
4. Match course names even if the code format is slightly different
5. Return courses in this exact JSON format:
[
  {
    "code": "01:198:111",
    "name": "Introduction to Computer Science", 
    "credits": 4,
    "semester": "Fall/Spring"
  }
]

6. If you can't find the exact course code, but the course name matches, use the closest match
7. Only include courses that are relevant to the Rutgers CS degree requirements
8. Don't include courses that are already in the user's completed list: ${completedCourses.join(', ')}
9. CRITICAL: For each course you identify, verify that it has a grade. If there's no grade in the transcript, DO NOT include it
10. Look carefully at the transcript format - courses with grades will show something like "4.0 A" or "3.0 B+". Courses without grades are NOT completed
11. IMPORTANT: In this transcript format, completed courses end with a grade (like "4.0 A"). In-progress courses end with just the credit amount (like "4.0" with no grade)
12. If a semester section shows "DEGREE CREDITS EARNED:" with no value or "TERM AVG:" with no value, those courses are NOT completed

Return only the JSON array, no other text.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes university transcripts and returns course data in JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    
    let courses;
    try {
      courses = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse ChatGPT response:', response);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    const validatedCourses = courses
      .filter(course => course.code && course.name && course.credits)
      .map(course => ({
        code: course.code,
        name: course.name,
        credits: parseInt(course.credits) || 3,
        semester: course.semester || "Fall/Spring"
      }))
      .filter(course => {
        const inProgressCourses = [
          '01:198:206', // Discrete Structures II
          '01:198:210', // Data Management for Data Science
          '01:750:203', // Physics for the Sciences
          '01:750:205', // Physics Lab
          '01:960:211'  // Statistics I
        ];
        
        if (inProgressCourses.includes(course.code)) {
          console.log(`Filtering out in-progress course: ${course.code}`);
          return false;
        }
        return true;
      });

    res.json({ courses: validatedCourses });

  } catch (error) {
    console.error('Transcript analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze transcript' });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount < 100) { // Minimum $1.00
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Support Rutgers Degree Planner',
              description: description || 'Thank you for supporting our project!',
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payment-cancelled`,
      metadata: {
        purpose: 'donation',
        amount: amount.toString(),
      },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

      switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', {
        amount: session.amount_total,
        customer: session.customer_details?.email,
        metadata: session.metadata
      });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 