import type { Metadata } from 'next'
import { contact } from '@/lib/contact'

export const metadata: Metadata = { title: 'Terms of use', description: 'The terms on which GoldOak and Super Agent are provided.' }

const sections: { title: string; body: string[] }[] = [
  { title: 'The service', body: ['Super Agent is a platform run by GoldOak Insurance Agency Limited that lets individuals and businesses register, ask questions, request quotes, report claims, upload documents and communicate with a licensed insurance intermediary ("your agency") on the website and on WhatsApp.', 'Insurance cover is provided by insurers under their policy terms. Your agency arranges it. Super Agent is not an insurer and does not itself provide cover.'] },
  { title: 'Guidance, not binding advice', body: ['Answers from the assistant are general guidance to help you understand insurance. They are not a quotation, a promise of cover, or a claims decision. Premiums, terms and claim outcomes are confirmed by your agency and the insurer in writing.', 'If anything is unclear or important, ask for a person: reply AGENT on WhatsApp or contact your agency.'] },
  { title: 'Your account', body: ['Keep your password and the WhatsApp number on your account safe; messages from that number are treated as yours. Tell your agency straight away if you lose access to it.', 'Give accurate information. Insurance depends on it, and inaccurate answers can affect a claim.'] },
  { title: 'Agencies', body: ['Agencies use the platform under a separate agreement with GoldOak, must hold the licences the Insurance Regulatory Authority requires, and are responsible for how they serve their clients. Each agency only sees its own clients.'] },
  { title: 'Acceptable use', body: ['Do not upload content you have no right to share, attempt to access other people\'s records, or misuse the assistant. We may suspend access to protect the platform or other users.'] },
  { title: 'Availability and liability', body: ['We work to keep the service available and reliable, but it depends on WhatsApp, insurers and other providers, and may occasionally be interrupted. To the extent the law allows, GoldOak is not liable for losses arising from reliance on general guidance or from interruptions outside its control.'] },
  { title: 'Contact', body: [`${contact.email} · ${contact.phone} · ${contact.location}`] },
]

export default function TermsPage() {
  return (
    <div className="section-padding bg-white">
      <div className="container-custom max-w-3xl">
        <p className="badge-gold mb-6 inline-flex">Terms of use</p>
        <h1 className="mb-4 font-serif text-heading-1 font-medium text-text-headline">Simple terms for a simple service.</h1>
        <p className="mb-10 text-body-lg text-text-body">By using the website, the portal or the Super Agent WhatsApp line you agree to these terms. Last updated September 2026.</p>
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
