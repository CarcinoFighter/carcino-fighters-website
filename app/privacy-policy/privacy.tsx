"use client";

import { useState, type ImgHTMLAttributes } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import Image from "next/image";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Footer } from "@/components/footer";

const easeSoft = [0.33, 1, 0.68, 1] as const;

function MarkdownImage({ src, alt }: { src: string; alt: string }) {
    const [error, setError] = useState(false);
    if (error) {
        return (
            <img
                src={src}
                alt={alt}
                className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto w-full object-cover"
                loading="lazy"
            />
        );
    }
    return (
        <Image
            src={src}
            alt={alt}
            width={1200}
            height={800}
            sizes="(max-width: 768px) 100vw, 800px"
            className="rounded-lg shadow-lg my-8 max-w-full overflow-hidden h-auto"
            onError={() => setError(true)}
        />
    );
}

// Hardcoded content for now
const markdownContent = `
## Privacy Policy

**Last Updated: 09/02/2026**

The Carcino Foundation values your trust, and we understand the importance of protecting your privacy. We want to make sure that you understand how your information is collected and used by us. This Privacy Statement describes 

- what information we collect about you,
- including what and how we collect it;
- how we use it,
- with whom we may share it,
- what choices you have regarding our use of your information.

This statement applies to all information collected by **The Carcino Foundation** through our "Services," which include:

- **Direct Communications:** Any information shared via electronic, written, or oral communication.
- **Digital Services:** Data collected through our website, including interactions with integrated **Artificial Intelligence (AI) technologies**.
- **Offline & Third-Party Data:** Information gathered through offline interactions or received from authorized third parties.

**Your Consent:** By accessing our Services or providing your personal information to us, you acknowledge and agree to the practices outlined in this Privacy Statement.

When you engage with The Carcino Foundation we collect a variety of information. In general, the type of information we collect on you will depend on how you choose to interact with The Carcino Foundation. For instance, if you are using our website to gather or search information on cancer related topics we will need a type of information from you. 

The type of data we collect depends on how you interact with The Carcino Foundation. We collect **"Personal Information",** data that identifies you directly or can be linked to you as an individual.

### Survivors:

Your name, cancer subtype, your story and information that has been made available to us, with your consent, during the interview, is made available publicly on our Site in text form. Slight modifications to the tone of the article is made without altering the content. 

*Personal information are required for organisational documentation only, and are kept confidential.*

### Data Analytics:

We use data to evaluate engagement levels with our Site and programs. We also perform data analysis and research activities to gain a greater general understanding of needs of patients, caregivers, audience. This analysis helps us improve experience, support, mission delivery. We do not use automated decision-making without humsn intervention in an ethical way. When we perform data analytics we may also use information that has been anonymised in a manner that it no longer reveals your specific identity. 

### Internet Protocol Address:

Your IP address is automatically assigned to your computer by your Internet Service Provider. An IP address may be identified and logged automatically in our server log files whenever a user accesses the Services, along with the time of visit and the page(s) that were visited. We use IP addresses for purposes such as calculating usage levels, diagnosing server problems, and administering the Services. We may also derive your approximate location from your IP address. 

### **Categories of Data:**

- **Contact Information:** Such as your name, email address, mailing address, and phone number.
- **Demographic Information:** Basic details that help us understand our community (e.g., age or location).
- **Health Information:** Information regarding your relationship to cancer, shared voluntarily to help us provide relevant resources.
- **Employment Information:** Professional history and qualifications (relevant to staff and volunteers).
- **Internet Activity:** Data collected through cookies and tracking technologies regarding how you use our site (unless you choose to opt-out).

### How We Collect Information

We collect data through several primary channels:

- **Site Use & Public Forums:** Information provided via our website.
    
    **(Note:** Information posted in public forums becomes public. Please use caution when sharing personal details.) 
    
- **Event Registration:** When registering for events, you may share your relationship to cancer (e.g., survivor or caregiver) to help us tailor your experience.
- **Employment & Volunteering:** We collect work history and may conduct background checks depending on the role. Generally, collected through our Sign Up forms on the Site.
- **Third-Party Partnerships:** We receive information from partners during fundraising campaigns or promotions. This may include donor reports (name, contact info, and donation amount).
- **Healthcare provider for campaigns and underprivilege support:** We will require your educational qualification, contact information, employment status, demographic status and/or business contact infomation through online platforms like Gmail, Whatsapp. *For organisational data documentation only.*
- **Collaborations:** If you partner with The Carcino Foundation to provide services, or help us with our mission, we may collect business information, employer and contact information. If it is necessary for purposes of paying you for services provided, we may also collect bank information, employer, identification number, etc.

*These information are confidential, and are required only for documentation purposes. No above mentioned categories of data are shared with third parties or public unless stated.* *No personal information is made public.* 

### Data Protection and Security

- technical security measures
- access to personal data
- any third-parties that are involved
- how and where data is stored
- user responsibility

### Third-Party Sharing

We might use and share your data with third-party organizations we are affiliated with for the purpose of cancer awareness and outreach. 

### Cookies and Tracking

A cookie is a small text file that the website you visit sends to your computer. The cookie essentially tracks the user’s behavior on the site.

Essential cookies that are stored: 

- **jwt auth cookie:** Personal data, as in, name, profile picture (optional), email address, date of birth, username, phone number, description (optional) and encrypted password data is stored when you sign up to the website.
    
    An option is provided to have a private account where the jwt auth cookie won't be exposed.
    
- **Google oauth:** Signing up through Google limits the data storage to openid, email and profile (including image and name).

3rd party cookie that is stored:

- **Google analytics (GA4):** Through this, data related to site access, device type, language and accessibility setting of the device, pages visited, buttons clicked, time spent, referrers clicked and traffic source used to enter the website, e.g. social media, direct link, or some other campaigns etc. is taken.

*No sensitive personal health data is tracked through cookies without explicit consent.*

### With whom we may share your personal information

*The Carcino Foundation does not sell or share personal information of its constituents.*

- Personal Information are shared with campaign volunteers, third party collaborators, service providers, only if/when required. With your consent.
- We may need to share personal information with third parties assisting us with operational servies like website hosting, data analytics, email delivery, IT infrastructure.
- Volunteers, Healthcare providers, employees - We may share limited personal information with the internal team assisting our organisation and to collaborating NGOs, Fundraising organisations who require the information as part of their duties. Confidentiality is maintained throughout.

### Your Rights

The Carcino Foundation is an India-based organisation and the rights for users of our website are in line with the rights given to Indians. You have the right to access, to request a copy of, to correct, to opt-out of data sharing, and to delete your Personal Information. We request you to contact us for the same.

In case of deletion, some personal information will be retained to document this request.

***With your consent. In addition to the other uses described in this section, we may also use your information as you expressly authorized us to do so. We will explicitly inform you on the way we use your information.*** 

*Internal employees have access to organisational data documentation.*

### Contact Us

If you have any queries about our privacy policy, or if you wish to update/correct your personal profile or change your communication preferences, please contact us at:

**E-mail:** [support@carcino.work](mailto:support@carcino.work)

**Telephone:** +91 87774 29831`;

export function Privacy() {
    return (
        <div>
            <div className="w-full px-5 sm:px-20 sm:pt-[80px] relative gap-6 bg-background font-giest min-h-screen overflow-x-hidden">
                <ScrollProgress className="hidden md:block" />
                <div className="relative pt-10 flex flex-col justify-center ">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full flex gap-5 flex-col sm:flex-row justify-center items-center"
                    >
                        <div className="sm:hidden">
                            <Image src={"/logo.png"} alt="Logo" width={54} height={54} />
                        </div>

                        <div className="max-w-4xl sm:px-10 sm:overflow-y-visible overflow-x-hidden">
                            <h1
                                className="  text-5xl leading-[0.9]
  sm:text-6xl sm:leading-[0.9]
  lg:text-7xl lg:leading-[0.9] whitespace-pre-wrap
  text-center font-wintersolace font-bold
  bg-gradient-to-r from-[#70429b] from-8% to-[#dfcbf0] to-60%
  bg-clip-text text-transparent py-4 px-10">
                                Privacy Policy
                            </h1>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="flex flex-col w-full px-3 pt-12"
                    >
                        <div className="relative max-w-4xl mx-auto px-2 sm:px-0 overflow-hidden">
                            <article
                                className="
                            prose
                            prose-sm sm:prose-base lg:prose-lg
                            relative
                            max-w-full sm:max-w-4xl
                            dark:prose-invert
                            font-dmsans
"
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        h1: (props) => <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />,
                                        h2: (props) => <h2 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                                        h3: (props) => <h3 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                        p: (props) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                                        a: (props) => (
                                            <a className="text-primary hover:text-primary/80 underline" {...props} />
                                        ),
                                        ul: (props) => <ul className="list-disc list-inside my-4" {...props} />,
                                        ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-1" {...props} />,
                                        blockquote: (props) => (
                                            <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4" {...props} />
                                        ),
                                        code: (props) => (
                                            <code className="bg-muted text-muted-foreground px-1.5 py-0.5 rounded" {...props} />
                                        ),
                                        pre: (props) => (
                                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4" {...props} />
                                        ),
                                        img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
                                            const src = typeof props.src === "string" ? props.src : undefined;
                                            if (!src) return null;
                                            return <MarkdownImage src={src} alt={props.alt ?? ""} />;
                                        },
                                    }}
                                >
                                    {markdownContent}
                                </ReactMarkdown>
                            </article>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
