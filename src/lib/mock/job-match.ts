import { JobDescription, JobMatchResult } from '@/types/analysis';

export const mockJobDescription: JobDescription = {
  id: 'jd-1',
  title: 'AI Engineer',
  company: 'TechCorp Global',
  description: `We are looking for an experienced AI Engineer to join our growing machine learning team. You will design, build, and deploy machine learning models that power our core product features. The ideal candidate has strong experience with deep learning frameworks, NLP, and production ML systems.

Responsibilities:
- Design and implement machine learning models for natural language understanding and generation
- Build and maintain ML pipelines for training, evaluation, and deployment
- Collaborate with product and engineering teams to integrate ML models into production systems
- Conduct experiments and A/B tests to evaluate model performance
- Monitor model performance in production and implement improvements
- Contribute to the team's technical roadmap and best practices

Requirements:
- 4+ years of experience in machine learning engineering
- Strong proficiency in Python and deep learning frameworks (PyTorch or TensorFlow)
- Experience with NLP, transformers, and large language models
- Hands-on experience with MLOps tools (MLflow, Kubeflow, or similar)
- Experience deploying models to production at scale
- Strong understanding of distributed computing and cloud platforms (AWS, GCP)
- Excellent communication skills and ability to work cross-functionally
- MS or PhD in Computer Science, Machine Learning, or related field

Nice to have:
- Experience with retrieval-augmented generation (RAG)
- Contributions to open-source ML projects
- Experience with model optimization and quantization
- Publication record in top ML conferences`,
  requirements: [
    'Python', 'PyTorch', 'TensorFlow', 'NLP', 'Transformers', 'LLM',
    'MLOps', 'MLflow', 'Kubeflow', 'AWS', 'GCP', 'Production ML',
    'A/B Testing', 'Deep Learning', 'Distributed Computing',
  ],
  savedAt: '2025-09-14T10:00:00Z',
};

export const mockJobMatchResult: JobMatchResult = {
  jobDescription: mockJobDescription,
  overallMatch: 78,
  matchedSkills: [
    { skill: 'Python', found: true, section: 'Skills', confidence: 'high' },
    { skill: 'PyTorch', found: true, section: 'Skills', confidence: 'high' },
    { skill: 'TensorFlow', found: true, section: 'Skills', confidence: 'high' },
    { skill: 'NLP', found: true, section: 'Experience', confidence: 'high' },
    { skill: 'Transformers', found: true, section: 'Experience', confidence: 'high' },
    { skill: 'MLOps', found: true, section: 'Skills', confidence: 'high' },
    { skill: 'Kubeflow', found: true, section: 'Skills', confidence: 'high' },
    { skill: 'AWS', found: true, section: 'Skills', confidence: 'medium' },
    { skill: 'A/B Testing', found: true, section: 'Experience', confidence: 'medium' },
    { skill: 'Production ML', found: true, section: 'Experience', confidence: 'high' },
  ],
  missingSkills: [
    { skill: 'GCP', found: false, confidence: 'medium' },
    { skill: 'LLM', found: false, confidence: 'high' },
    { skill: 'Distributed Computing', found: false, confidence: 'medium' },
    { skill: 'MLflow', found: false, confidence: 'low' },
    { skill: 'Deep Learning', found: false, confidence: 'high' },
  ],
  relevantExperience: [
    'Your recommendation engine work at Nexus AI directly maps to the "deploy ML models powering core product features" requirement',
    'Your MLOps pipeline experience aligns well with the ML pipeline responsibilities',
    'Open-source RAG framework matches the "nice to have" RAG experience',
    'Your NLP work at DataStream maps to the NLP and transformers requirements',
  ],
  suggestions: [
    'Add "Deep Learning" explicitly to your skills section — your experience clearly includes it but the term is not present',
    'Mention experience with large language models (LLMs) if applicable, as this is a key requirement',
    'Consider adding GCP experience if you have any, even from personal or academic projects',
    'Add "MLflow" to your skills if you have used it — it is listed alongside Kubeflow in the requirements',
  ],
  warnings: [
    'These suggestions are based on keyword matching. Only add skills you genuinely possess.',
    'Verify each suggestion against your actual experience before applying.',
    'Keyword presence does not guarantee a match — context and depth of experience matter.',
  ],
};
