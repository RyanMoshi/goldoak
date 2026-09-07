import type { Metadata } from 'next'
import { contact } from '@/lib/contact'

export const metadata: Metadata = { title: 'Privacy notice', description: 'How GoldOak and Super Agent collect, use and protect your personal information.' }

const sections: { title: string; body: string[] }[] = [
  { title: 'Who we are', body: ['GoldOak Insurance Agency Limited ("GoldOak", "we") operates this website and the Super Agent assistant, including the shared Super Agent WhatsApp line used by GoldOak and partner agencies. Each agency you deal with is responsible for its own client records; GoldOak runs the platform on their behalf.'] },
  { title: 'What we collect', body: ['Details you give us: your name, phone number, email, business details, what you want to protect, and the messages you send on the website or WhatsApp.', 'Documents you upload or send on WhatsApp (for example an ID, logbook, policy schedule, claim form or photo), and the information our systems read from them.', 'Records of your insurance journey with an agency: quotes, policies, claims, enquiries, notifications and the conversation history.', 'Technical information needed to run the service securely, such as delivery and error logs.'] },
  { title: 'How we use it', body: ['To register you, route you to the right agency, answer your questions, prepare quotes, register and track claims, generate documents and send you reminders and updates on WhatsApp, email or in your portal.', 'To let the agency you deal with serve you: its staff see your records, conversations and documents. Other agencies never do.', 'To keep the platform safe: fraud prevention, audit trails and troubleshooting.'] },
  { title: 'Automated assistance', body: ['Super Agent uses an AI assistant to understand your messages, guide you through forms, read documents you send, and answer general insurance questions. The assistant gives general guidance; it does not make binding decisions about cover, price or claims. A person at the agency confirms anything binding, and you can ask for a person at any time by replying 7 or AGENT.', 'Document text may be processed by third-party AI providers under contract to extract information. We do not use your documents to train models.'] },
  { title: 'Sharing', body: ['With the agency you deal with, and with insurers when you ask for a quote or make a claim.', 'With service providers that host the platform, deliver messages and process documents, each bound by contract to protect your data.', 'When the law requires it.'] },
  { title: 'Keeping it safe', body: ['Records are kept in a managed database with encryption in transit, private document storage that is never publicly reachable, role-based access for agency staff, and an audit log of sensitive actions.'] },
  { title: 'Your choices', body: ['Reply STOP on WhatsApp to end reminders. Ask the agency or write to us to see, correct or delete your information, subject to record-keeping duties under insurance law.', `Contact: ${contact.email} · ${contact.phone}`] },
]

export default function PrivacyPage() {
  return (
    <div className="section-padding bg-white">
      <div className="container-custom max-w-3xl">
        <p className="badge-gold mb-6 inline-flex">Privacy notice</p>
        <h1 className="mb-4 font-serif text-heading-1 font-medium text-text-headline">Your information, plainly.</h1>
        <p className="mb-10 text-body-lg text-text-body">This notice explains what GoldOak and Super Agent collect, why, and how to reach us. Last updated September 2026.</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-2 font-serif text-xl font-medium text-text-headline">{s.title}</h2>
              <div className="space-y-2 text-body-sm text-text-body">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
