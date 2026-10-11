import { notFound } from 'next/navigation';
import { KINDS, QUESTIONS, SLUGS } from '@/lib/survey';
import Survey from '@/components/Survey';

export const metadata = {
  title: "So'rovnoma | Investage",
  robots: { index: false, follow: false },
};

export default async function SurveyPage({ params }) {
  const { kind: slug } = await params;
  const kind = SLUGS[slug];
  if (!kind) notFound();
  return <Survey kind={kind} title={KINDS[kind].title} questions={QUESTIONS[kind]} />;
}
