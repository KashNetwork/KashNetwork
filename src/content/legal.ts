// Content ported from the original Kash Network site.
export type Block = { t: 'h2' | 'h3' | 'p' | 'li'; x: string };
export type LegalDoc = { title: string; effective: string; lede: string; blocks: Block[] };

export const LEGAL_DOCS: Record<string, LegalDoc> = {
  "affiliate-agreement": {
    "title": "Affiliate Agreement",
    "effective": "Effective June 27, 2026",
    "lede": "The terms and responsibilities for participating in the Kash Network affiliate program.",
    "blocks": [
      {
        "t": "h2",
        "x": "1. Introduction"
      },
      {
        "t": "p",
        "x": "This Affiliate Agreement (\"Agreement\") is entered into by and between Kash Network LLC (\"Company\") and the individual or entity registering as an affiliate (\"Affiliate\"). This Agreement governs the terms and conditions for participation in the Company’s Affiliate Program for the promotion of Kash Network. By enrolling in the Affiliate Program, the Affiliate agrees to comply with all terms and conditions set forth herein. This Agreement becomes effective on the date the Affiliate registers for the program (\"Effective Date\")."
      },
      {
        "t": "h2",
        "x": "2. Definitions"
      },
      {
        "t": "p",
        "x": "\"Affiliate\": An individual or entity that has enrolled in the Affiliate Program and promotes the Company’s products."
      },
      {
        "t": "p",
        "x": "\"Affiliate Program\": The program provided by the Company to Affiliates for the promotion of Kash Network."
      },
      {
        "t": "p",
        "x": "\"Affiliate Link\": A unique URL provided to the Affiliate for tracking sales generated through the Affiliate's marketing efforts."
      },
      {
        "t": "p",
        "x": "\"Commission\": The financial remuneration earned by the Affiliate for each sale made through their Affiliate Link."
      },
      {
        "t": "p",
        "x": "\"Confidential Information\": Any non-public information disclosed by the Company to the Affiliate under this Agreement."
      },
      {
        "t": "p",
        "x": "\"End User\": The final purchaser of Kash Network."
      },
      {
        "t": "p",
        "x": "\"Products\": Kash Network and any other products designated by the Company."
      },
      {
        "t": "p",
        "x": "\"Website\": The website located at https://www.kash.network"
      },
      {
        "t": "h2",
        "x": "3. Affiliate Program Enrollment"
      },
      {
        "t": "p",
        "x": "To enroll in the Affiliate Program, the Affiliate must complete and submit an application through the Company’s website. The Company reserves the right to approve or reject any application at its sole discretion. Enrollment in the program is contingent upon acceptance of the application by the Company."
      },
      {
        "t": "h2",
        "x": "4. Affiliate Obligations"
      },
      {
        "t": "p",
        "x": "The Affiliate agrees to:"
      },
      {
        "t": "p",
        "x": "Promote the Products in a professional manner."
      },
      {
        "t": "p",
        "x": "Use only promotional materials provided or approved by the Company."
      },
      {
        "t": "p",
        "x": "Comply with all applicable laws and regulations."
      },
      {
        "t": "p",
        "x": "Refrain from engaging in any deceptive, misleading, or unethical practices."
      },
      {
        "t": "p",
        "x": "Not make any false or unauthorized claims about the Products."
      },
      {
        "t": "h2",
        "x": "5. Affiliate Links"
      },
      {
        "t": "p",
        "x": "The Affiliate will be provided with unique Affiliate Links. The Affiliate is responsible for ensuring that the Affiliate Links are correctly implemented and maintained on their website or promotional channels. The Company is not liable for any tracking errors resulting from improperly formatted Affiliate Links."
      },
      {
        "t": "h2",
        "x": "6. Commissions"
      },
      {
        "t": "p",
        "x": "The Affiliate will earn a Commission for each sale of the Products made through their Affiliate Links. The Commission rate is specified on the Company’s website and may be subject to change at the Company’s discretion. Commissions will be paid out on a bi-weekly basis, provided that the Affiliate has reached the minimum payout threshold specified by the Company."
      },
      {
        "t": "h2",
        "x": "7. Order Processing"
      },
      {
        "t": "p",
        "x": "The Company will process orders placed by End Users who follow the Affiliate Links. The Company reserves the right to reject orders that do not comply with its policies. The Company will be responsible for all aspects of order processing and fulfillment, including payment processing, cancellations, and returns."
      },
      {
        "t": "h2",
        "x": "8. Policies and Pricing"
      },
      {
        "t": "p",
        "x": "All End Users purchasing through the Affiliate Links will be deemed customers of the Company. The Company’s policies and pricing will apply to these customers. The Company may change its policies and pricing at any time. The Affiliate does not have authority to modify any of the Company’s policies or pricing."
      },
      {
        "t": "h2",
        "x": "9. License"
      },
      {
        "t": "p",
        "x": "The Company grants the Affiliate a non-exclusive, non-transferable, revocable license to access and use approved marketing materials for the sole purpose of promoting the Products under this Agreement. The Affiliate agrees not to use any Company trademarks, logos, or other intellectual property in a manner that is misleading, defamatory, infringing, or otherwise damaging to the Company."
      },
      {
        "t": "h2",
        "x": "10. Confidentiality"
      },
      {
        "t": "p",
        "x": "The Affiliate agrees to keep all Confidential Information disclosed by the Company confidential and to use such information only for the purposes of performing their obligations under this Agreement. The Affiliate shall not disclose any Confidential Information to any third party without the prior written consent of the Company. This obligation of confidentiality shall survive the termination of this Agreement for a period of five (5) years."
      },
      {
        "t": "h2",
        "x": "11. Term and Termination"
      },
      {
        "t": "p",
        "x": "11.1 Term    This Agreement shall commence on the Effective Date and remain in effect until terminated by either Party."
      },
      {
        "t": "h3",
        "x": "11.2 Termination"
      },
      {
        "t": "p",
        "x": "Either Party may terminate this Agreement at any time, with or without cause, by giving the other Party written notice. Upon termination, the Affiliate must cease using all Affiliate Links and remove all promotional materials related to the Products."
      },
      {
        "t": "h3",
        "x": "11.3 Affiliate Commission Eligibility Policy"
      },
      {
        "t": "p",
        "x": "Affiliate commissions are earned only while the affiliate maintains an active, paid membership on the website. If a membership lapses, is canceled, or is not renewed, any unpaid or future commissions will be forfeited. Commissions resume only after paid membership is reinstated and remains in good standing. Affiliates are responsible for ensuring proper disclosure of their affiliate relationship in accordance with applicable laws and guidelines."
      },
      {
        "t": "h2",
        "x": "12. Relationship of Parties"
      },
      {
        "t": "p",
        "x": "The Affiliate and the Company are independent contractors. Nothing in this Agreement shall create any partnership, joint venture, agency, franchise, sales representative, or employment relationship between the Parties. The Affiliate has no authority to act on behalf of the Company or bind the Company in any way."
      },
      {
        "t": "h2",
        "x": "13. Affiliate Representations and Warranties"
      },
      {
        "t": "p",
        "x": "The Affiliate represents and warrants that:"
      },
      {
        "t": "p",
        "x": "They have the full right, power, and authority to enter into this Agreement and perform their obligations."
      },
      {
        "t": "p",
        "x": "They will comply with all applicable laws, rules, and regulations in their performance under this Agreement."
      },
      {
        "t": "p",
        "x": "They will not engage in any activity that could harm the Company’s reputation or interests."
      },
      {
        "t": "h2",
        "x": "14. Limitation of Liability"
      },
      {
        "t": "p",
        "x": "To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental, special, or consequential damages, or any loss of revenue, profits, or data, arising in connection with this Agreement, even if the Company has been advised of the possibility of such damages. The Company's total liability arising from this Agreement shall not exceed the total Commissions paid to the Affiliate under this Agreement."
      },
      {
        "t": "h2",
        "x": "15. Disclaimers"
      },
      {
        "t": "p",
        "x": "The Company makes no express or implied warranties or representations with respect to the Affiliate Program or any Products sold through the Affiliate Program. The Company does not guarantee that the Affiliate Program will be uninterrupted or error-free and will not be liable for any consequences of interruptions or errors."
      },
      {
        "t": "h2",
        "x": "16. Governing Law"
      },
      {
        "t": "p",
        "x": "This Agreement shall be governed by and construed in accordance with the laws of Texas, without regard to its conflict of law principles. Any disputes arising under or in connection with this Agreement shall be resolved exclusively in the state or federal courts located in Texas."
      },
      {
        "t": "h2",
        "x": "17. Modifications to the Agreement"
      },
      {
        "t": "p",
        "x": "The Company reserves the right to amend or modify this Agreement at any time, in its sole discretion. Any changes will be effective upon posting on the Company’s website. The Affiliate’s continued participation in the Affiliate Program after such posting constitutes acceptance of the new terms and conditions."
      },
      {
        "t": "h2",
        "x": "18. Compliance with Laws"
      },
      {
        "t": "p",
        "x": "The Affiliate agrees to comply with all applicable laws, statutes, regulations, and codes in their performance under this Agreement. The Affiliate will not engage in any conduct that would cause the Company to violate any laws, statutes, regulations, or codes."
      },
      {
        "t": "h2",
        "x": "19. Miscellaneous Provisions"
      },
      {
        "t": "p",
        "x": "19.1 Entire Agreement    This Agreement constitutes the entire agreement between the Parties regarding its subject matter and supersedes all prior agreements and understandings."
      },
      {
        "t": "h3",
        "x": "19.2 Severability"
      },
      {
        "t": "p",
        "x": "If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect."
      },
      {
        "t": "h3",
        "x": "19.3 Waiver"
      },
      {
        "t": "p",
        "x": "No waiver of any breach or default hereunder shall be deemed a waiver of any subsequent breach or default."
      },
      {
        "t": "h2",
        "x": "20. Contact Information"
      },
      {
        "t": "p",
        "x": "For any questions or notices related to this Agreement, Affiliates may contact the Company at:"
      },
      {
        "t": "p",
        "x": "Email: support@kash.network"
      },
      {
        "t": "p",
        "x": "Mailing Address:"
      },
      {
        "t": "p",
        "x": "Kash Network LLC"
      },
      {
        "t": "p",
        "x": "539 W. Commerce St Suite #1019"
      },
      {
        "t": "p",
        "x": "Dallas, TX 75208"
      }
    ]
  },
  "contact": {
    "title": "Contact Us",
    "effective": "Effective July 28, 2026",
    "lede": "For any questions or notices, you may contact us.",
    "blocks": [
      {
        "t": "h2",
        "x": "Contact Information"
      },
      {
        "t": "li",
        "x": "Email: support@kash.network"
      },
      {
        "t": "li",
        "x": "Mailing Address:"
      },
      {
        "t": "p",
        "x": "Kash Network LLC"
      },
      {
        "t": "p",
        "x": "539 W. Commerce St Suite #1019,"
      },
      {
        "t": "p",
        "x": "Dallas, TX 75208"
      }
    ]
  },
  "cookie-policy": {
    "title": "Cookie Policy",
    "effective": "Effective July 28, 2026",
    "lede": "How Kash Network uses cookies, similar technologies, and your related choices.",
    "blocks": [
      {
        "t": "h2",
        "x": "1. Introduction"
      },
      {
        "t": "p",
        "x": "Welcome to Kash Network LLC. This Cookie Policy explains how we, Kash Network LLC, use cookies and similar technologies to recognize you when you visit our website at https://www.kash.network. It explains what these technologies are and why we use them, as well as your rights to control our use of them."
      },
      {
        "t": "h2",
        "x": "2. What are cookies?"
      },
      {
        "t": "p",
        "x": "Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information."
      },
      {
        "t": "h2",
        "x": "3. Why do we use cookies?"
      },
      {
        "t": "p",
        "x": "We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Websites to operate, and we refer to these as \"essential\" or \"strictly necessary\" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Website. Third parties serve cookies through our Websites for advertising, analytics, and other purposes."
      },
      {
        "t": "h2",
        "x": "4. Types of cookies used on our Website"
      },
      {
        "t": "li",
        "x": "Essential website cookies: These cookies are strictly necessary to provide you with services available through our Websites and to use some of its features, such as access to secure areas."
      },
      {
        "t": "li",
        "x": "Performance and functionality cookies: These cookies are used to enhance the performance and functionality of our Websites but are non-essential to their use. However, without these cookies, certain functionality may become unavailable."
      },
      {
        "t": "li",
        "x": "Analytics and customization cookies: These cookies collect information that is used either in aggregate form to help us understand how our Websites are being used or how effective our marketing campaigns are, or to help us customize our Websites for you."
      },
      {
        "t": "li",
        "x": "Advertising cookies: These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests."
      },
      {
        "t": "h2",
        "x": "5. Control of Cookies"
      },
      {
        "t": "p",
        "x": "You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services."
      },
      {
        "t": "h2",
        "x": "6. Other tracking technologies"
      },
      {
        "t": "p",
        "x": "We may use other tracking technologies, such as web beacons (also known as \"tracking pixels\") and tracking URLs, to obtain Log Data about users. Web beacons are embedded images that help deliver cookies and count visits, while tracking URLs are used to understand from which referring website the Website is accessed."
      },
      {
        "t": "h2",
        "x": "7. Third-party cookies"
      },
      {
        "t": "p",
        "x": "Our website uses third-party services that may also use cookies. You will be notified the first time you visit our website. We do not control the use of these cookies and cannot access them due to the way that cookies work, as cookies can only be accessed by the party who originally set them."
      },
      {
        "t": "h3",
        "x": "7.1 Affiliate Tracking Cookies"
      },
      {
        "t": "p",
        "x": "We use affiliate tracking cookies to identify and track referrals made by our affiliates and partners."
      },
      {
        "t": "p",
        "x": "When you click on an affiliate link to our website, a cookie may be placed on your device. This cookie allows us to:"
      },
      {
        "t": "p",
        "x": "Recognize that you were referred by a specific affiliate"
      },
      {
        "t": "p",
        "x": "Track your activity on our website for attribution purposes"
      },
      {
        "t": "p",
        "x": "Attribute commissions or referral credits to the appropriate affiliate"
      },
      {
        "t": "p",
        "x": "These cookies do not typically store personally identifiable information but may include unique identifiers that allow us to associate your visit and actions with a specific affiliate partner."
      },
      {
        "t": "h3",
        "x": "7.2 Referral Tracking"
      },
      {
        "t": "p",
        "x": "Referral tracking technologies (including cookies, pixels, and similar technologies) are used to monitor when a user arrives at our website through a referral link."
      },
      {
        "t": "p",
        "x": "This allows us to:"
      },
      {
        "t": "p",
        "x": "Measure the effectiveness of our affiliate and referral programs"
      },
      {
        "t": "p",
        "x": "Ensure accurate tracking of referrals"
      },
      {
        "t": "p",
        "x": "Prevent fraud and abuse within our affiliate system"
      },
      {
        "t": "p",
        "x": "Referral tracking may occur across sessions and, in some cases, across devices where technically feasible."
      },
      {
        "t": "h3",
        "x": "7.3 Commission Attribution Cookies"
      },
      {
        "t": "p",
        "x": "Commission attribution cookies are used to determine whether a purchase or qualifying action should result in a commission payment to an affiliate."
      },
      {
        "t": "p",
        "x": "These cookies may:"
      },
      {
        "t": "p",
        "x": "Store a unique affiliate identifier"
      },
      {
        "t": "p",
        "x": "Track the time and date of a referral"
      },
      {
        "t": "p",
        "x": "Remain active for a defined period (e.g., 30–90 days) unless deleted earlier by the user"
      },
      {
        "t": "p",
        "x": "If a qualifying transaction occurs within the attribution window, the corresponding affiliate may be credited with a commission."
      },
      {
        "t": "h3",
        "x": "7.4 Cookie Duration and Control"
      },
      {
        "t": "p",
        "x": "Affiliate and referral cookies may remain on your device for a limited period, depending on the applicable attribution window. You can control or delete cookies at any time through your browser settings. Please note that disabling cookies may affect the functionality of certain parts of our website, including referral tracking."
      },
      {
        "t": "p",
        "x": "By using our website and engaging with affiliate links, you consent to the use of affiliate tracking technologies as described in this policy."
      },
      {
        "t": "h2",
        "x": "8. Do Not Track signals"
      },
      {
        "t": "p",
        "x": "We do not currently respond to 'Do Not Track' signals and operating mechanisms in your web browser."
      },
      {
        "t": "h2",
        "x": "9. Updates to this Cookie Policy"
      },
      {
        "t": "p",
        "x": "We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies."
      },
      {
        "t": "h2",
        "x": "10. More information"
      },
      {
        "t": "p",
        "x": "If you have any questions about our use of cookies or other technologies, please email us at:"
      },
      {
        "t": "p",
        "x": "support@kash.network"
      }
    ]
  },
  "income-disclaimer": {
    "title": "Income Disclaimer",
    "effective": "Effective July 28, 2026",
    "lede": "Important information about potential earnings and the factors that influence results.",
    "blocks": [
      {
        "t": "h2",
        "x": "1. Introduction"
      },
      {
        "t": "p",
        "x": "Welcome to Kash Network LLC. This document is the Income Disclaimer relevant to all products and services offered through our website, https://www.kash.network. By purchasing or using any of our digital marketing products, services, and programs, you agree to the terms laid out in this policy."
      },
      {
        "t": "h2",
        "x": "2. Scope of Products"
      },
      {
        "t": "p",
        "x": "Kash Network LLC specializes in providing digital marketing products, services, and programs. These products, services, and programs are designed to empower entrepreneurs in the digital marketing space. The products, services, and programs are digital in nature and accessible immediately after purchase."
      },
      {
        "t": "h2",
        "x": "3. No Guarantee of Income"
      },
      {
        "t": "p",
        "x": "We assert that while our products, services, and programs are designed to provide valuable information and tools to succeed in digital marketing, there are no guaranteed outcomes. Success depends on various factors that are beyond our control, including individual effort, market conditions, and personal skills."
      },
      {
        "t": "h2",
        "x": "4. Earnings and Success Disclaimer"
      },
      {
        "t": "p",
        "x": "Results from the use of our digital marketing products, services, and programs vary among users. Testimonials and examples found on our website are exceptional results and do not guarantee that all purchasers will achieve similar outcomes. Success in any business requires a combination of work, skill, and dedication. The use of our products, services, and programs should be based on your own due diligence and you agree that Kash Network LLC and its affiliates are not liable for any success or failure of your business. The Company does not guarantee specific income or earnings."
      },
      {
        "t": "h2",
        "x": "5. Effort and Commitment"
      },
      {
        "t": "p",
        "x": "Your potential to achieve significant earnings and success by using our products and services depends on the time you devote to the program, the ideas and techniques mentioned, your finances, knowledge, and various skills. Since these factors differ among individuals, we cannot guarantee your level of success or income level."
      },
      {
        "t": "h2",
        "x": "6. Market Conditions"
      },
      {
        "t": "p",
        "x": "You acknowledge that the market dynamics play a crucial role in your success and that the economic environment is ever-changing. Market conditions that can influence sales include but are not limited to consumer demand, economic policies, and competition."
      },
      {
        "t": "h2",
        "x": "7. Skills and Expertise"
      },
      {
        "t": "p",
        "x": "Your individual capacity in digital marketing, including your knowledge, expertise, and execution, affects your ability to succeed. We provide education, tools, and materials, but ultimately, the execution and application of these are solely up to you."
      },
      {
        "t": "h2",
        "x": "8. Strategic Application"
      },
      {
        "t": "p",
        "x": "Success in promoting digital marketing products, services, and programs also depends significantly on your business strategies. The application of effective marketing, sales techniques, and customer service will impact your ability to profit from these products, services, and programs. We provide guidance and suggestions, but the practical application and adaptation to your specific market are critical."
      },
      {
        "t": "h2",
        "x": "9. Nature of Digital Products"
      },
      {
        "t": "p",
        "x": "Our products, services, and programs are digital and provided in the form of access via our digital platform. Once a purchase is made, the product is considered delivered. Digital products differ from physical goods in that they are immediately reproducible at little to no cost."
      },
      {
        "t": "h2",
        "x": "10. Consultation Encouraged"
      },
      {
        "t": "p",
        "x": "We encourage you to consult with professionals (financial advisors, legal experts, or business consultants) prior to purchasing our products if you are unsure about the potential income or the business opportunities they present. Such consultations can provide tailored advice and help align expectations based on your individual circumstances."
      },
      {
        "t": "h2",
        "x": "11. Contact Information"
      },
      {
        "t": "p",
        "x": "For any questions or clarification regarding this Income Disclaimer, please contact us at:"
      },
      {
        "t": "li",
        "x": "Email: support@kash.network"
      },
      {
        "t": "h2",
        "x": "12. Amendments to the Policy"
      },
      {
        "t": "p",
        "x": "This policy may be amended from time to time in response to changes in our practices, feedback from customers, or changes in legislation. The latest version of this policy will always be available on our website, and we will notify you of significant changes through our standard communication channels."
      }
    ]
  },
  "privacy-policy": {
    "title": "Privacy Policy",
    "effective": "Effective June 27, 2026",
    "lede": "This Privacy Policy explains how we collect, use, and protect your information when you use Kash Network products and services.",
    "blocks": [
      {
        "t": "h2",
        "x": "1. Introduction"
      },
      {
        "t": "p",
        "x": "1.1 Purpose and Commitment    Welcome to Kash Network LLC (\"we\", \"us\", \"our\"). We are committed to protecting your privacy and handling your data openly and transparently. We respect your privacy. This policy explains your rights regarding the information we collect and how it protects your privacy under applicable laws including the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), the Personal Information Protection and Electronic Documents Act (PIPEDA), the California Online Privacy Protection Act (CalOPPA) and any other applicable to our jurisdiction."
      },
      {
        "t": "h3",
        "x": "1.2 Applicability"
      },
      {
        "t": "p",
        "x": "This policy applies to all information collected through your interaction with us on our website located at https://www.kash.network, through our mobile applications, and any other online service that links to this policy."
      },
      {
        "t": "h2",
        "x": "2. Effective Date and Revisions"
      },
      {
        "t": "p",
        "x": "2.1 Effective Date    This Privacy Policy takes effect as of 1/27/2025 and will remain in effect except concerning any changes in its provisions in the future, which will be in effect immediately after being posted on this page."
      },
      {
        "t": "h3",
        "x": "2.2 Revisions to the Policy"
      },
      {
        "t": "p",
        "x": "We reserve the right to update or change our Privacy Policy at any time. You should check this Privacy Policy periodically. Your continued use of the Service after we post any modifications to the Privacy Policy on this page will constitute your acknowledgment of the modifications and your consent to abide by and be bound by the modified Privacy Policy."
      },
      {
        "t": "h2",
        "x": "3. Information Collection"
      },
      {
        "t": "p",
        "x": "3.1 Types of Data Collected    We collect various types of information for various purposes to provide and improve our Service to you. These include:"
      },
      {
        "t": "li",
        "x": "Personal Identification Information: Name, email address, telephone number, address, and other demographics."
      },
      {
        "t": "li",
        "x": "Billing Information: Payment card details, billing address, and other financial information necessary for transaction processing."
      },
      {
        "t": "li",
        "x": "Technical and Usage Data: Information that web browsers, mobile devices, and servers typically make available, such as IP address, browser type, unique device identifiers, language preference, referring site, the date and time of access, operating system, and mobile network information."
      },
      {
        "t": "h2",
        "x": "4. Information You Provide"
      },
      {
        "t": "p",
        "x": "4.1 Voluntary Disclosure    You may provide us additional information by filling in forms on our website or by corresponding with us by phone, email, or otherwise. This includes information you provide when you create an account, subscribe to our service, place an order, subscribe to our newsletters, provide feedback, or report a problem with our site."
      },
      {
        "t": "h2",
        "x": "5. Information Collected Automatically"
      },
      {
        "t": "p",
        "x": "5.1 Collection Methods    As is true of most websites, we gather certain information automatically and store it in log files. This information may include IP addresses, browser type, internet service provider (ISP), referring/exit pages, operating system, date/time stamp, and/or clickstream data."
      },
      {
        "t": "h3",
        "x": "5.2 Cookies and Tracking Technologies"
      },
      {
        "t": "p",
        "x": "We use cookies and similar tracking technologies to track the activity on our Products and Services and we hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. Please refer to our cookie policy for more information on this section.      6. Use of Information     6.1 Utilization of Data    The data we collect helps us to provide, maintain, protect, and improve our existing services and develop new ones. This data is also used to:"
      },
      {
        "t": "li",
        "x": "Manage your account and provide you with customer support."
      },
      {
        "t": "li",
        "x": "Perform research and analysis about your use of, or interest in, our products, services, or content."
      },
      {
        "t": "li",
        "x": "Communicate with you by email, postal mail, telephone, and/or mobile devices about products or services that may be of interest to you."
      },
      {
        "t": "li",
        "x": "Operate our website and applications, deliver the products and services you request, and improve the overall user experience."
      },
      {
        "t": "li",
        "x": "Send you administrative or service-related emails, and marketing communications (if you opt-in), and respond to your inquiries."
      },
      {
        "t": "li",
        "x": "Tailor content and offers relevant to your interests and preferences."
      },
      {
        "t": "li",
        "x": "To understand how our services are used, identify trends, and measure the effectiveness of our marketing campaigns."
      },
      {
        "t": "li",
        "x": "To prevent fraud, enforce our terms of service, and protect the security and integrity of our systems."
      },
      {
        "t": "li",
        "x": "To fulfill legal or regulatory requirements, such as responding to subpoenas or court orders."
      },
      {
        "t": "h3",
        "x": "6.2 User Information and Privacy"
      },
      {
        "t": "p",
        "x": "We take the privacy of our users seriously. We do not sell, rent, or trade personal information with third parties for their commercial purposes."
      },
      {
        "t": "h2",
        "x": "7. Sharing of Information"
      },
      {
        "t": "p",
        "x": "7.1 Disclosure Practices    We do not share your personal information with others except as indicated within this policy or when we inform you and allow you to opt out of having your personal information shared. We may share personal information with:"
      },
      {
        "t": "li",
        "x": "Service Providers"
      },
      {
        "t": "p",
        "x": "We may share information with third parties that perform certain services on our behalf. These services may include fulfilling orders, providing customer service and marketing assistance, performing business and sales analysis, supporting our website functionality, and supporting contests, sweepstakes, surveys, and other features offered through our website."
      },
      {
        "t": "li",
        "x": "Compliance With Laws"
      },
      {
        "t": "p",
        "x": "We may disclose your information where required to do so by law or subpoena."
      },
      {
        "t": "h2",
        "x": "8. Third-Party Service Providers"
      },
      {
        "t": "p",
        "x": "8.1 Engagement of Third Parties    We may employ third-party companies and individuals to facilitate our Service (\"Service Providers\"), to provide the Service on our behalf, to perform Service-related services, or to assist us in analyzing how our Service is used. These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. We will not share mobile contact information with third parties or affiliates for marketing/promotional purposes. All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties."
      },
      {
        "t": "h3",
        "x": "8.2 Data Collection and Usage by Google Search Ads"
      },
      {
        "t": "p",
        "x": "Our website may utilize Google Search Ads to display targeted advertisements based on your browsing activities and interests. When you visit our site, Google may collect personal data such as your IP address, search queries, and interaction with advertisements. This data is processed by Google to deliver personalized advertising experiences and to measure the effectiveness of our ad campaigns. We may use Google Search Ads to promote our services more effectively and to reach audiences who may benefit from our products. The legal basis for processing your data in connection with Google Search Ads is your explicit consent, which you provide by accepting cookies on our website."
      },
      {
        "t": "h3",
        "x": "8.3 User Control and Rights"
      },
      {
        "t": "p",
        "x": "You have control over the personal information you share with Google through your ad settings and can opt out of personalized advertising by adjusting your preferences in your Google account. For more detailed information on how Google uses data when you use our site or apps, please visit Google's Privacy & Terms page."
      },
      {
        "t": "h3",
        "x": "8.4 Data Protection"
      },
      {
        "t": "p",
        "x": "We take measures to ensure that any data shared with Google is managed in accordance with privacy laws and our contractual agreements with Google, aiming to safeguard your privacy and data rights."
      },
      {
        "t": "h3",
        "x": "8.5 Data Processing by Calendly"
      },
      {
        "t": "p",
        "x": "We may utilize Calendly, a third-party service, for scheduling appointments directly through our website. When you use Calendly to book an appointment, it may collect personal information such as your name, email address, and phone number to facilitate the booking process. The management and protection of your data by Calendly are governed by Calendly’s Privacy Policy. Please note that while we may integrate these services, the handling of your data through Calendly is not under our direct control."
      },
      {
        "t": "h2",
        "x": "9. Legal Requirements"
      },
      {
        "t": "p",
        "x": "9.1 Disclosure for Law Enforcement    Under certain circumstances, Kash Network LLC may be required to disclose your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g., a court or a government agency)."
      },
      {
        "t": "h2",
        "x": "10. International Data Transfers"
      },
      {
        "t": "p",
        "x": "10.1 Data Transfer and Storage    Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the data, including Personal Data, to the United States and process it there."
      },
      {
        "t": "h2",
        "x": "11. Security of Your Data"
      },
      {
        "t": "p",
        "x": "11.1 Security Measures    We prioritize the security of your data. We implement robust security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These include encryption, firewalls, and secure server facilities. However, no internet-based site can be 100% secure, and we cannot guarantee absolute security."
      },
      {
        "t": "h3",
        "x": "11.2 Data Breach Notification"
      },
      {
        "t": "p",
        "x": "In the event of a data breach, we will promptly notify you in accordance with applicable law."
      },
      {
        "t": "h2",
        "x": "12. Data Retention"
      },
      {
        "t": "p",
        "x": "12.1 Retention Period    We retain your personal information only for as long as is necessary for the purposes set out in this Privacy Policy, including for the purposes of satisfying any legal, accounting, or reporting requirements. After the retention period, we will securely delete or anonymize your personal information."
      },
      {
        "t": "h2",
        "x": "13. Children’s Privacy"
      },
      {
        "t": "p",
        "x": "13.1 Age Limitations    Our Services are not designed for individuals under the age of 13 (“Children”). In compliance with the California Online Privacy Protection Act (CalOPPA), we do not intentionally gather personally identifiable information from children under the age of 13. If you are a parent or guardian and suspect that your child has provided us with personal information without your consent, please contact us without delay."
      },
      {
        "t": "h2",
        "x": "14. Your Rights Under General Data Protection Regulation (GDPR)"
      },
      {
        "t": "p",
        "x": "14.1 Rights of EU Residents    If you are a resident of the European Union, you have certain rights under the General Data Protection Regulation including the right to access, correct, update, or request deletion of your personal information. You also have the right to object to processing of your personal data, ask us to restrict processing of your personal information, or request portability of your personal information."
      },
      {
        "t": "h2",
        "x": "15. US Privacy Laws Compliance"
      },
      {
        "t": "p",
        "x": "15.1 Rights of California Residents    As a California resident, you have specific rights regarding access to, deletion of, and sharing of your personal data. Kash Network LLC complies with the California Consumer Privacy Act (CCPA) and provides California residents the right to not be discriminated against for exercising their rights.    15.2 Rights of Texas Residents    Texas residents are entitled to certain protections under state privacy laws alongside federal laws. While Texas does not currently have a consumer-specific data privacy law like the CCPA, it does enforce regulations that protect personal information from unauthorized disclosure and breaches. If you believe your privacy rights have been violated, you may file a complaint with the Texas Attorney General's office."
      },
      {
        "t": "h3",
        "x": "15.3 Compliance with Other Applicable US Privacy Laws"
      },
      {
        "t": "p",
        "x": "Kash Network LLC also complies with other applicable state and federal privacy laws in the United States. This compliance ensures that all our users, regardless of their state of residence, receive robust privacy protections related to access, correction, deletion, and usage of their personal data. We commit to not discriminating against any user for exercising their rights under these laws."
      },
      {
        "t": "h2",
        "x": "16. Your Rights Under PIPEDA"
      },
      {
        "t": "p",
        "x": "If you are a resident of Canada, the Personal Information Protection and Electronic Documents Act (PIPEDA) provides you with certain rights regarding your personal information. These rights include:"
      },
      {
        "t": "li",
        "x": "Right to Know: The right to be informed about what personal information we collect, how we use it, and with whom we may share it."
      },
      {
        "t": "li",
        "x": "Right to Access: The right to access and request a copy of the personal information we hold about you."
      },
      {
        "t": "li",
        "x": "Right to Correction: The right to request correction of any inaccurate or incomplete information."
      },
      {
        "t": "li",
        "x": "Right to Withdraw Consent: The right to withdraw your consent to the collection, use, or disclosure of your personal information, with some exceptions."
      },
      {
        "t": "h3",
        "x": "16.1 Protecting Your Privacy"
      },
      {
        "t": "p",
        "x": "We are committed to upholding the principles of PIPEDA and safeguarding your privacy. For more information on PIPEDA and our privacy practices, please refer to our full Privacy Policy. If you have any questions or wish to exercise your rights, please contact us on the email provided below in this document."
      },
      {
        "t": "h2",
        "x": "17. Managing Your Information"
      },
      {
        "t": "p",
        "x": "17.1 Accessing and Updating Your Information    You may access, update, or remove your personal information that we collect by logging into your account and reviewing your account settings and profile. If additional assistance is needed, you can contact us directly through the provided contact methods."
      },
      {
        "t": "h2",
        "x": "18. Opt-Out Options"
      },
      {
        "t": "p",
        "x": "18.1 Marketing Communications    You can opt-out of receiving marketing emails and text messages from us at any time by following the unsubscribe link included in such emails and texts. You can also request that we cease using your information for marketing purposes by contacting us directly."
      },
      {
        "t": "h2",
        "x": "19. Links to Other Websites"
      },
      {
        "t": "p",
        "x": "19.1 External Links    Our website may include links to external websites that are not directly controlled by us. While we aim to link only to sites that uphold the highest standards of privacy and security, users should exercise caution and review the privacy policies of any external sites before navigating them. We cannot guarantee or verify the contents of any externally linked website, and we are not responsible for any damages or implications caused by visiting such links."
      },
      {
        "t": "h2",
        "x": "20. Changes to This Privacy Policy"
      },
      {
        "t": "p",
        "x": "20.1 Policy Updates    We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"effective date\" at the top of this policy."
      },
      {
        "t": "h2",
        "x": "21. Contact Us"
      },
      {
        "t": "p",
        "x": "21.1 How to Reach Us    If you have any questions about this Privacy Policy, please contact us:"
      },
      {
        "t": "li",
        "x": "By email: ⦁ support@kash.network"
      },
      {
        "t": "h2",
        "x": "22. Effectiveness and Amendments"
      },
      {
        "t": "p",
        "x": "22.1 Binding Nature    This Privacy Policy is effective unless and until amended or replaced by Kash Network LLC. Amendments will be effective immediately upon the posting of the amended Privacy Policy on the website. Your continued use of our services following the posting of changes will constitute your acceptance of such changes."
      },
      {
        "t": "h2",
        "x": "23. Severability"
      },
      {
        "t": "p",
        "x": "23.1 Enforceability    If any provision of this Privacy Policy is held to be invalid or unenforceable, the remaining provisions will continue to be valid and enforceable. The invalid or unenforceable provision will be replaced with a valid and enforceable provision that achieves, to the extent possible, the economic, business, and other purposes of the invalid or unenforceable provision."
      },
      {
        "t": "h2",
        "x": "24. International Users"
      },
      {
        "t": "p",
        "x": "24.1 Applicability    Our website is accessible from countries around the world and may contain references to services and content that are not available in your country. These references do not imply that we intend to announce such services or content in your country. Our content is designed to comply with United States laws and regulations and is intended for use by residents of the United States."
      },
      {
        "t": "h2",
        "x": "25. Contact Information for Further Inquiry"
      },
      {
        "t": "p",
        "x": "25.1 Reaching Out    If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:"
      },
      {
        "t": "li",
        "x": "Via email at: support@kash.network"
      },
      {
        "t": "li",
        "x": "Mailing Address:"
      },
      {
        "t": "p",
        "x": "Kash Network LLC"
      },
      {
        "t": "p",
        "x": "539 W. Commerce St Suite #1019"
      },
      {
        "t": "p",
        "x": "Dallas, TX 75208"
      }
    ]
  },
  "refund-policy": {
    "title": "Refund Policy",
    "effective": "Effective July 28, 2026",
    "lede": "Our product & service refund terms in one place.",
    "blocks": [
      {
        "t": "h2",
        "x": "1. Introduction"
      },
      {
        "t": "p",
        "x": "Welcome to Kash Network LLC. This document is the Refund Policy relevant to all products, services, and programs offered through our website, https://www.kash.network. By purchasing or using any of our digital marketing products, services, and programs, you agree to the terms laid out in this policy.    2. Refund Policy"
      },
      {
        "t": "p",
        "x": "Due to the instantaneous, digital nature of our product and service delivery and the type of products sold (digital goods), all purchases/sales are final."
      },
      {
        "t": "p",
        "x": "Upon purchase, you are granted immediate access to proprietary systems and commission-earning opportunities."
      },
      {
        "t": "p",
        "x": "As such, refunds are not provided."
      },
      {
        "t": "p",
        "x": "Your $1 trial payment provides immediate access to our platform and is non-refundable. If you choose to continue after the 7-day trial period, your subscription will renew automatically at the regular subscription price. All subscription payments are non-refundable once processed."
      },
      {
        "t": "p",
        "x": "You may cancel your subscription at any time before the end of your 7-day trial to avoid being charged the full subscription price."
      },
      {
        "t": "p",
        "x": "By signing up, you acknowledge and agree to these terms."
      },
      {
        "t": "p",
        "x": "We do not “claw back” commissions paid to affiliates or partners."
      },
      {
        "t": "p",
        "x": "Therefore, once a sale is generated, commissions earned are non-reversible and fully retained by the client."
      },
      {
        "t": "h3",
        "x": "2.1 Billing & Chargeback Policy"
      },
      {
        "t": "p",
        "x": "By purchasing and accessing our products and services, you acknowledge and agree to the following:"
      },
      {
        "t": "p",
        "x": "You are purchasing a digital product and service that includes immediate access to educational materials, proprietary systems, marketing infrastructure, and/or commission-earning opportunities."
      },
      {
        "t": "p",
        "x": "You understand that value is delivered upon access, not solely upon results."
      },
      {
        "t": "p",
        "x": "You agree that all sales are final."
      },
      {
        "t": "p",
        "x": "You further agree that:"
      },
      {
        "t": "p",
        "x": "You will not initiate a chargeback, dispute, or payment reversal with your bank or payment processor without first contacting our support team at support@kash.network"
      },
      {
        "t": "p",
        "x": "to attempt resolution."
      },
      {
        "t": "p",
        "x": "Initiating a chargeback without contacting support first constitutes a breach of these Terms."
      },
      {
        "t": "p",
        "x": "In the event of a chargeback or payment dispute, we reserve the right to provide this agreement, along with proof of access, usage, onboarding activity, and communication logs, as evidence to the payment processor."
      },
      {
        "t": "h3",
        "x": "2.2 Proof of Delivery & Service Fulfillment"
      },
      {
        "t": "p",
        "x": "You acknowledge that fulfillment of this service begins immediately upon purchase, including but not limited to:"
      },
      {
        "t": "p",
        "x": "Account creation and onboarding access"
      },
      {
        "t": "p",
        "x": "Delivery of digital education materials, systems, and tools"
      },
      {
        "t": "p",
        "x": "Activation of marketing and/or sales processes"
      },
      {
        "t": "p",
        "x": "These actions constitute full or partial delivery of the service, regardless of outcome."
      },
      {
        "t": "h3",
        "x": "2.3 Dispute Resolution Agreement"
      },
      {
        "t": "p",
        "x": "By completing your purchase, you agree to:"
      },
      {
        "t": "p",
        "x": "First contact support to resolve any issue in good faith"
      },
      {
        "t": "p",
        "x": "Allow a reasonable time for resolution"
      },
      {
        "t": "p",
        "x": "Not misuse dispute or chargeback mechanisms to bypass the stated refund policy"
      },
      {
        "t": "p",
        "x": "We reserve the right to deny future service, revoke access, and pursue recovery of funds in cases of fraudulent or abusive chargebacks."
      },
      {
        "t": "h3",
        "x": "2.4 Refund Request Process:"
      },
      {
        "t": "p",
        "x": "Requests must be sent to support@kash.network"
      },
      {
        "t": "p",
        "x": "All requests are subject to internal review and verification of compliance, including account activity, communication logs, and system usage."
      },
      {
        "t": "p",
        "x": "We reserve the right to deny any refund request."
      },
      {
        "t": "h3",
        "x": "2.5 Subscription Cancellations:"
      },
      {
        "t": "p",
        "x": "You may cancel your subscription at any time to prevent future billing. Cancellation does not retroactively qualify you for a refund."
      },
      {
        "t": "h2",
        "x": "3. Consumer Acknowledgment"
      },
      {
        "t": "p",
        "x": "By completing a purchase, you acknowledge that you have read this policy, understand it, and agree to its terms. You agree that you will not initiate a chargeback or dispute without first contacting support and allowing resolution in accordance with our Terms, Refund Policy, and Guarantee conditions."
      },
      {
        "t": "h2",
        "x": "4. Contact Information"
      },
      {
        "t": "p",
        "x": "For any questions or clarification regarding this Refund Policy, if you experience any issues, or believe you were charged in error, please contact us at:"
      },
      {
        "t": "li",
        "x": "Email: support@kash.network"
      }
    ]
  },
  "terms-of-service": {
    "title": "Terms of Service",
    "effective": "Effective June 27, 2026",
    "lede": "These Terms govern your use of our services and include important information about access, billing, refunds, and acceptable use.",
    "blocks": [
      {
        "t": "h2",
        "x": "1. Introduction"
      },
      {
        "t": "h3",
        "x": "1.1 Acceptance of Terms"
      },
      {
        "t": "p",
        "x": "Welcome to Kash Network LLC (\"Company\", \"we\", \"our\", or \"us\"). This website, accessible from https://www.kash.network, is designed to provide digital marketing products, services, and programs. By accessing and using our site, you agree to be bound by these Terms and Conditions (\"Terms\") and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using our site."
      },
      {
        "t": "h3",
        "x": "1.2 Changes to Terms"
      },
      {
        "t": "p",
        "x": "We reserve the right to modify these Terms at any time. Changes will become effective immediately upon their posting on the website. Your continued use of the site after such posting will constitute acceptance of the revised Terms. We will always make a reasonable effort to notify you of any significant changes."
      },
      {
        "t": "h3",
        "x": "2.2 Legal Compliance"
      },
      {
        "t": "h3",
        "x": "2.1 Compliance with Laws"
      },
      {
        "t": "p",
        "x": "You agree to use this site in strict compliance with all applicable local, state, federal, and international laws, regulations, and treaties, including but not limited to those related to data privacy, international communications, and the exportation of technical or personal data."
      },
      {
        "t": "h2",
        "x": "3. User Eligibility"
      },
      {
        "t": "h3",
        "x": "3.1 Age Requirement"
      },
      {
        "t": "p",
        "x": "This Site is offered and available only to users who are 18 years of age or older. By using this Site, you represent and warrant that you are of legal age to form a binding contract with the Company and meet all foregoing eligibility requirements."
      },
      {
        "t": "h3",
        "x": "3.2 Jurisdictional Restrictions"
      },
      {
        "t": "p",
        "x": "You must not access or use the Site if you are barred from receiving services under the laws of the United States or any other applicable jurisdiction. If you access the Site from other jurisdictions, you do so at your own risk and are responsible for compliance with local laws."
      },
      {
        "t": "h2",
        "x": "4. Account Registration and Management"
      },
      {
        "t": "h3",
        "x": "4.1 Account Creation"
      },
      {
        "t": "p",
        "x": "To access certain features of the Site, you must register for an account. When creating your account, you agree to provide accurate, current, and complete information and to update such information to keep it accurate, current, and complete."
      },
      {
        "t": "h3",
        "x": "4.2 Account Responsibilities"
      },
      {
        "t": "p",
        "x": "You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or password or any other breach of security."
      },
      {
        "t": "h2",
        "x": "5. Intellectual Property Rights"
      },
      {
        "t": "h3",
        "x": "5.1 Ownership of Content"
      },
      {
        "t": "p",
        "x": "All materials displayed or performed on the site (including, but not limited to text, videos, graphics, articles, photographs, images, illustrations, and software) are the proprietary property of the Company or its licensors and are protected by both domestic and international intellectual property laws."
      },
      {
        "t": "h3",
        "x": "5.2 Grant of License"
      },
      {
        "t": "p",
        "x": "You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Site and the resources available for download from the Site strictly in accordance with these Terms."
      },
      {
        "t": "h2",
        "x": "6. User Conduct"
      },
      {
        "t": "h3",
        "x": "6.1 Prohibited Activities"
      },
      {
        "t": "p",
        "x": "You agree not to engage in any of the following prohibited activities: copying, distributing, or disclosing any part of the Site in any medium, including without limitation by any automated or non-automated “scraping”; using any automated system, including without limitation “robots,” “spiders,” “offline readers,” etc., to access the Site in a manner that sends more request messages to the servers than a human can reasonably produce in the same period of time by using a conventional on-line web browser."
      },
      {
        "t": "h3",
        "x": "6.2 Content Standards"
      },
      {
        "t": "p",
        "x": "You agree not to post, upload, transmit, or otherwise make available any content that is unlawful, harmful, threatening, abusive, harassing, tortious, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable."
      },
      {
        "t": "h2",
        "x": "7. Services and Products Disclaimer"
      },
      {
        "t": "h3",
        "x": "7.1 Product / Service / Program Description"
      },
      {
        "t": "p",
        "x": "Kash Network LLC provides digital marketing products, services, programs. We strive to describe and display our products, services, and programs as accurately as possible. However, we do not guarantee that the products, services, and programs descriptions are accurate, complete, reliable, current, or error-free."
      },
      {
        "t": "h3",
        "x": "7.2 No Guarantee of Results"
      },
      {
        "t": "p",
        "x": "The Company makes no guarantee regarding the results that you will see from using the information, products, services, and programs provided on the website. You agree that your use of or reliance on any information, products, services, and programs materials is solely at your own risk and that the Company is not responsible for any failures or discrepancies that may result."
      },
      {
        "t": "h3",
        "x": "7.3 Availability of Services"
      },
      {
        "t": "p",
        "x": "The Company reserves the right to modify, suspend, or discontinue the Services (or any part or content thereof) at any time with or without notice to you, and the Company will not be liable to you or to any third party should it exercise such rights."
      },
      {
        "t": "h2",
        "x": "8. Refunds and Cancellations"
      },
      {
        "t": "h3",
        "x": "8.1 Refund Policy"
      },
      {
        "t": "p",
        "x": "Kash Network LLC provides digital products, services, and programs which are accessible immediately upon purchase."
      },
      {
        "t": "p",
        "x": "We stand behind the effectiveness of our digital marketing education program."
      },
      {
        "t": "p",
        "x": "Your $1 trial payment provides immediate access to our platform and is non-refundable. If you choose to continue after the 7-day trial period, your subscription will renew automatically at the regular subscription price. All subscription payments are non-refundable once processed."
      },
      {
        "t": "p",
        "x": "You may cancel your subscription at any time before the end of your 7-day trial to avoid being charged the full subscription price."
      },
      {
        "t": "p",
        "x": "By signing up, you acknowledge and agree to these terms."
      },
      {
        "t": "p",
        "x": "Commission Policy:"
      },
      {
        "t": "p",
        "x": "We do not “claw back” commissions paid to affiliates or partners."
      },
      {
        "t": "p",
        "x": "Therefore, any commissions earned during the service period are non-reversible and fully retained by the client."
      },
      {
        "t": "p",
        "x": "Subscription Cancellations:"
      },
      {
        "t": "p",
        "x": "You may cancel your subscription at any time to prevent future billing. Cancellation does not retroactively qualify you for a refund."
      },
      {
        "t": "p",
        "x": "All requests are subject to internal review and verification of compliance, including account activity, communication logs, and system usage."
      },
      {
        "t": "p",
        "x": "We reserve the right to review account activity, communication logs, and campaign data."
      },
      {
        "t": "p",
        "x": "We reserve the right to deny any refund requests."
      },
      {
        "t": "p",
        "x": "The Company does not guarantee specific income or earnings."
      },
      {
        "t": "p",
        "x": "Billing & Chargeback Policy"
      },
      {
        "t": "p",
        "x": "By purchasing and accessing our products and services, you acknowledge and agree to the following:"
      },
      {
        "t": "p",
        "x": "You are purchasing a digital marketing education product / program that includes immediate access to proprietary systems, marketing infrastructure, and/or commission-earning opportunities."
      },
      {
        "t": "p",
        "x": "You understand that value is delivered upon access, not solely upon results."
      },
      {
        "t": "p",
        "x": "You agree that all sales are final."
      },
      {
        "t": "p",
        "x": "You further agree that:"
      },
      {
        "t": "p",
        "x": "You will not initiate a chargeback, dispute, or payment reversal with your bank or payment processor without first contacting our support team at support@kash.network to attempt resolution."
      },
      {
        "t": "p",
        "x": "Initiating a chargeback without contacting support first constitutes a breach of these Terms."
      },
      {
        "t": "p",
        "x": "In the event of a chargeback or payment dispute, we reserve the right to provide this agreement, along with proof of access, usage, onboarding activity, and communication logs, as evidence to the payment processor."
      },
      {
        "t": "p",
        "x": "Proof of Delivery & Service Fulfillment"
      },
      {
        "t": "p",
        "x": "You acknowledge that fulfillment of this service begins immediately upon purchase, including but not limited to:"
      },
      {
        "t": "p",
        "x": "Account creation and onboarding access"
      },
      {
        "t": "p",
        "x": "Delivery of systems, tools, or training"
      },
      {
        "t": "p",
        "x": "Activation of marketing and/or sales processes"
      },
      {
        "t": "p",
        "x": "These actions constitute full or partial delivery of the service, regardless of outcome."
      },
      {
        "t": "p",
        "x": "Dispute Resolution Agreement"
      },
      {
        "t": "p",
        "x": "By completing your purchase, you agree to:"
      },
      {
        "t": "p",
        "x": "First contact support to resolve any issue in good faith"
      },
      {
        "t": "p",
        "x": "Allow a reasonable time for resolution"
      },
      {
        "t": "p",
        "x": "Not misuse dispute or chargeback mechanisms to bypass the stated refund policy"
      },
      {
        "t": "p",
        "x": "We reserve the right to deny future service, revoke access, and pursue recovery of funds in cases of fraudulent or abusive chargebacks."
      },
      {
        "t": "p",
        "x": "By completing your purchase, you agree that you will not initiate a chargeback or dispute without first contacting support and allowing resolution in accordance with our Terms and Refund Policy."
      },
      {
        "t": "h3",
        "x": "8.2 Cancellation of Services"
      },
      {
        "t": "p",
        "x": "You may choose to discontinue your use of any of our products and services at any time. However, please note that discontinuing use does not entitle you to a refund of any portion of your payment, and you will be responsible for any outstanding payments due at the time of cancellation. For more information on this section, please refer to our Refund Policy & Income Disclaimer."
      },
      {
        "t": "h2",
        "x": "9. Intellectual Property Infringement"
      },
      {
        "t": "h3",
        "x": "9.1 Copyright Claims"
      },
      {
        "t": "p",
        "x": "If you believe that your copyright has been infringed upon by our website content, please inform us by providing a detailed account of the alleged infringement, including the specific material claimed to be infringing and its location on the site."
      },
      {
        "t": "h3",
        "x": "9.2 Response to Claims"
      },
      {
        "t": "p",
        "x": "Upon receipt of a valid infringement notification, we will remove or disable access to the infringing material and notify the content provider of the issue. Repeat offenders will have all material removed from the website and their access terminated."
      },
      {
        "t": "h2",
        "x": "10. Limitation of Liability"
      },
      {
        "t": "h3",
        "x": "10.1 Disclaimer of Warranties"
      },
      {
        "t": "p",
        "x": "You expressly agree that use of the site is at your sole risk. The site and any data, information, third-party software, reference sites, services, or software made available in conjunction with or through the site are provided on an \"as is\" and \"as available,\" \"with all faults\" basis and without warranties or representations of any kind either express or implied."
      },
      {
        "t": "h3",
        "x": "10.2 Limitation of Liability"
      },
      {
        "t": "p",
        "x": "To the fullest extent permitted by law, in no event will Kash Network LLC, its affiliates, officers, directors, employees, agents, licensors, or suppliers be liable for any indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of revenues, profits, goodwill, use, data, or other intangible losses arising out of or related to your use of the site or the services, regardless of whether such damages are based on contract, tort (including negligence and strict liability), warranty, statute, or otherwise."
      },
      {
        "t": "h2",
        "x": "11. Indemnification"
      },
      {
        "t": "h3",
        "x": "11.1 General"
      },
      {
        "t": "p",
        "x": "You agree to indemnify, defend, and hold harmless Kash Network LLC, its officers, directors, employees, agents, licensors, suppliers, and any third-party information providers to the service from and against all losses, expenses, damages, and costs, including reasonable attorneys' fees, resulting from any violation of this agreement (including negligent or wrongful conduct) by you or any other person accessing the service."
      },
      {
        "t": "h2",
        "x": "12. Modifications to the Service"
      },
      {
        "t": "h3",
        "x": "12.1 Rights of Modification"
      },
      {
        "t": "p",
        "x": "Kash Network LLC reserves the right at any time and from time to time to modify or discontinue, temporarily or permanently, the product or service (or any part thereof) with or without notice. You agree that Kash Network LLC shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service."
      },
      {
        "t": "h2",
        "x": "13. Termination"
      },
      {
        "t": "h3",
        "x": "13.1 Termination by Company"
      },
      {
        "t": "p",
        "x": "Kash Network LLC may terminate your access to all or any part of the website at any time, with or without cause, with or without notice, effective immediately, which may result in the forfeiture and destruction of all information associated with your membership."
      },
      {
        "t": "h3",
        "x": "13.2 Termination by User"
      },
      {
        "t": "p",
        "x": "You may terminate your account at any time by following the instructions on the website. However, you will not receive a refund for any service already paid for, unless otherwise specified in these Terms."
      },
      {
        "t": "h3",
        "x": "13.3 Effect of Termination"
      },
      {
        "t": "p",
        "x": "Upon termination of your account, your right to use the service will immediately cease. All provisions of these Terms which, by their nature, should survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability."
      },
      {
        "t": "h2",
        "x": "14. Dispute Resolution"
      },
      {
        "t": "h3",
        "x": "14.1 Governing Law"
      },
      {
        "t": "p",
        "x": "These Terms shall be governed and construed in accordance with the laws of the State of Texas, United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights."
      },
      {
        "t": "h3",
        "x": "14.2 Arbitration Agreement"
      },
      {
        "t": "p",
        "x": "In the event of any dispute, claim, question, or disagreement arising from or relating to these Terms or the breach thereof, the parties hereto shall use their best efforts to settle the dispute, claim, question, or disagreement. To this effect, they shall consult and negotiate with each other in good faith and, recognizing their mutual interests, attempt to reach a just and equitable solution satisfactory to both parties. If they do not reach such a solution within a period of 60 days, then, upon notice by either party to the other, all disputes, claims, questions, or disagreements shall be finally settled by arbitration administered by the American Arbitration Association in accordance with the provisions of its Commercial Arbitration Rules."
      },
      {
        "t": "h2",
        "x": "15. Accessibility"
      },
      {
        "t": "h3",
        "x": "15.1 Accessibility Commitment"
      },
      {
        "t": "p",
        "x": "Kash Network LLC is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards."
      },
      {
        "t": "h3",
        "x": "15.2 Feedback for Accessibility"
      },
      {
        "t": "p",
        "x": "We welcome your feedback on the accessibility of Kash Network LLC. Please let us know if you encounter accessibility barriers on Kash Network LLC by contacting: support@kash.network"
      },
      {
        "t": "h2",
        "x": "16. Third-Party Links"
      },
      {
        "t": "h3",
        "x": "16.1 Third-Party Sites"
      },
      {
        "t": "p",
        "x": "The Site may contain links to third-party websites or services that are not owned or controlled by Kash Network LLC. Kash Network LLC has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party websites or services."
      },
      {
        "t": "h3",
        "x": "16.2 Disclaimer for Third-Party Links"
      },
      {
        "t": "p",
        "x": "You further acknowledge and agree that Kash Network LLC shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any such websites or services."
      },
      {
        "t": "p",
        "x": "By purchasing or using our services, you acknowledge that referral tracking and commission attribution systems are used and that attribution outcomes are determined based on our tracking systems and policies. We are not responsible for tracking discrepancies caused by browser settings, device changes, ad blockers, or cookie restrictions."
      },
      {
        "t": "h2",
        "x": "17. Amendments and Modifications"
      },
      {
        "t": "h3",
        "x": "17.1 Notice of Amendments"
      },
      {
        "t": "p",
        "x": "We reserve the right to amend or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion."
      },
      {
        "t": "h3",
        "x": "17.2 Acceptance of Amendments"
      },
      {
        "t": "p",
        "x": "By continuing to access or use our Products or Services after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Products or Services."
      },
      {
        "t": "h2",
        "x": "18. Data Protection"
      },
      {
        "t": "h3",
        "x": "18.1 Commitment to Data Protection"
      },
      {
        "t": "p",
        "x": "We take the protection and security of your personal information very seriously. We will process your personal information in accordance with our Privacy Policy, which sets out our data protection policies and procedures."
      },
      {
        "t": "h3",
        "x": "18.2 Data Usage"
      },
      {
        "t": "p",
        "x": "Your information will not be shared, sold, rented, or disclosed apart from as described in the Privacy Policy."
      },
      {
        "t": "h2",
        "x": "19. Force Majeure"
      },
      {
        "t": "h3",
        "x": "19.1 Non-liability for Force Majeure"
      },
      {
        "t": "p",
        "x": "Kash Network LLC shall not be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond Kash Network LLC’s reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation."
      },
      {
        "t": "h3",
        "x": "19.2 Mitigation"
      },
      {
        "t": "p",
        "x": "In the event of a force majeure, we will do everything in our power to resume service as soon as possible."
      },
      {
        "t": "h2",
        "x": "20. Entire Agreement"
      },
      {
        "t": "h3",
        "x": "20.1 Completeness of the Agreement"
      },
      {
        "t": "p",
        "x": "These Terms constitute the entire agreement between you and Kash Network LLC regarding your use of the Site, superseding any prior agreements between you and Kash Network LLC regarding your use of the Site."
      },
      {
        "t": "h3",
        "x": "20.2 Precedence"
      },
      {
        "t": "p",
        "x": "In the event of any inconsistencies between these Terms and any future published terms of use or understanding, the last published Terms or terms of use shall prevail."
      },
      {
        "t": "h2",
        "x": "21. Severability"
      },
      {
        "t": "h3",
        "x": "21.1 Validity of Provisions"
      },
      {
        "t": "p",
        "x": "If any provision of these Terms is found to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions of these Terms will remain in full force and effect. The invalid or unenforceable provision will be replaced by a valid, enforceable provision that most closely matches the intent of the original provision."
      },
      {
        "t": "h2",
        "x": "22. Non-Waiver"
      },
      {
        "t": "h3",
        "x": "22.1 Enforcement of Terms"
      },
      {
        "t": "p",
        "x": "Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms will remain in effect."
      },
      {
        "t": "h2",
        "x": "23. Assignment"
      },
      {
        "t": "h3",
        "x": "23.1 Prohibition on Transfer"
      },
      {
        "t": "p",
        "x": "You may not assign or transfer your rights or obligations under these Terms without our prior written consent. Any attempted assignment or transfer without such consent will be null and void."
      },
      {
        "t": "h3",
        "x": "23.2 Company’s Right to Assign"
      },
      {
        "t": "p",
        "x": "Kash Network LLC may assign or transfer its rights and obligations under these Terms at any time without restriction."
      },
      {
        "t": "h2",
        "x": "24. Notifications"
      },
      {
        "t": "h3",
        "x": "24.1 Method of Notification"
      },
      {
        "t": "p",
        "x": "We may provide notifications to you as required by law or for marketing or other purposes via email, phone, or text to the primary email address and/or phone number specified in your account, hard copy, or posting of such notice on our digital platform. We are not responsible for any automatic filtering you or your network provider may apply to email notifications."
      },
      {
        "t": "h2",
        "x": "25. Copyright and Trademark"
      },
      {
        "t": "h3",
        "x": "25.1 Copyright Protection"
      },
      {
        "t": "p",
        "x": "All content on the Site including text, graphics, logos, images, as well as their selection and arrangement, is owned by Kash Network LLC or its licensors and is protected by copyright and intellectual property laws. You are not permitted to use, modify, distribute, or reproduce the content without our express written consent."
      },
      {
        "t": "h3",
        "x": "25.2 Trademarks"
      },
      {
        "t": "p",
        "x": "The trademarks, logos, and service marks displayed on the Site are the registered and unregistered marks of Kash Network LLC or its licensors. Nothing contained on this Site grants, by implication, estoppel, or otherwise, any license or right to use any marks displayed on the Site without the prior written permission of Kash Network LLC or the respective owner."
      },
      {
        "t": "h2",
        "x": "26. Confidentiality"
      },
      {
        "t": "h3",
        "x": "26.1 Confidential Information"
      },
      {
        "t": "p",
        "x": "You may obtain direct access to certain confidential information of Kash Network LLC and its affiliates, including business secrets, methods, policies, and procedures. You must hold and maintain in strict confidence all such confidential information, and not disclose to any third party without the prior written approval of Kash Network LLC."
      },
      {
        "t": "h3",
        "x": "26.2 Exclusions"
      },
      {
        "t": "p",
        "x": "The obligations set forth in this section shall not apply to any information that (a) was known to the public prior to its disclosure or becomes known to the public subsequently through no fault of your own; (b) is disclosed to you by a third party legally entitled to make such disclosure without a confidentiality obligation."
      },
      {
        "t": "h2",
        "x": "27. Feedback and User Submissions"
      },
      {
        "t": "h3",
        "x": "27.1 Submission of Ideas"
      },
      {
        "t": "p",
        "x": "Kash Network LLC encourages users to submit feedback, ideas, and suggestions for improvements to the Site (\"Feedback\"). You acknowledge and agree that all Feedback you give will be considered non-confidential and non-proprietary."
      },
      {
        "t": "h3",
        "x": "27.2 Use of Feedback"
      },
      {
        "t": "p",
        "x": "You hereby grant to Kash Network LLC a non-exclusive, worldwide, perpetual, irrevocable, fully-paid, royalty-free, sublicensable, and transferable license to copy, distribute, transmit, publicly display, use, reproduce, modify, publish, edit, translate, create derivative works from, and display the Feedback in any manner and for any purpose, including commercial purposes."
      },
      {
        "t": "h2",
        "x": "28. Compliance with Export Laws"
      },
      {
        "t": "h3",
        "x": "28.1 Export Control"
      },
      {
        "t": "p",
        "x": "You agree to comply with all export laws and regulations of the United States and other applicable jurisdictions. You promise not to — directly or indirectly — sell, export, reexport, transfer, divert, or otherwise dispose of any software or service provided on the Site to any destination, entity, or person prohibited by the laws or regulations of the United States."
      },
      {
        "t": "h3",
        "x": "28.2 Responsibility"
      },
      {
        "t": "p",
        "x": "You bear responsibility for complying with U.S. export laws and regulations and all other applicable laws and regulations governing exports, re-exports, and transfers of Kash Network LLC’s products, services, and programs and will obtain all required U.S. and local authorizations, permits, or licenses."
      },
      {
        "t": "h2",
        "x": "29. Governing Language"
      },
      {
        "t": "h3",
        "x": "29.1 Language of the Terms"
      },
      {
        "t": "p",
        "x": "These Terms and Conditions were written in English. If they are translated into other languages and there is a discrepancy between the English text and the translation, the English text will prevail."
      },
      {
        "t": "h2",
        "x": "30. Health and Safety"
      },
      {
        "t": "h3",
        "x": "30.1 Compliance"
      },
      {
        "t": "p",
        "x": "You agree to comply with all applicable health and safety regulations and to use Kash Network LLC’s products, services, and programs in a manner that does not pose a health or safety hazard to yourself or others."
      },
      {
        "t": "h2",
        "x": "31. Ethical Use Policy"
      },
      {
        "t": "h3",
        "x": "31.1 Ethical Standards"
      },
      {
        "t": "p",
        "x": "You agree to use the Site and its content ethically without infringing on the rights of others or trying to harm, misuse, or get unauthorized access to any system, data, password, or other information, whether it belongs to Kash Network LLC or another party."
      },
      {
        "t": "h3",
        "x": "31.2 Reporting Unethical Use"
      },
      {
        "t": "p",
        "x": "You commit to reporting any unethical use of the Site or violations of these Terms to Kash Network LLC immediately upon recognition."
      },
      {
        "t": "h2",
        "x": "32. Children’s Privacy"
      },
      {
        "t": "h3",
        "x": "32.1 Age Limitations"
      },
      {
        "t": "p",
        "x": "The Site is not intended for individuals under the age of 18. If we learn that we have collected personal information from children under 18, we will take steps to delete that information from our servers immediately."
      },
      {
        "t": "h2",
        "x": "33. Contact Us"
      },
      {
        "t": "h3",
        "x": "33.1 Contact Information"
      },
      {
        "t": "p",
        "x": "For any questions, concerns, or complaints regarding these Terms, please contact us at:"
      },
      {
        "t": "li",
        "x": "Email: support@kash.network"
      },
      {
        "t": "li",
        "x": "Mailing Address:"
      },
      {
        "t": "p",
        "x": "Kash Network LLC"
      },
      {
        "t": "p",
        "x": "539 W. Commerce St Suite #1019"
      },
      {
        "t": "p",
        "x": "Dallas, TX 75208"
      },
      {
        "t": "h2",
        "x": "34. Survival"
      },
      {
        "t": "h3",
        "x": "34.1 Ongoing Obligations"
      },
      {
        "t": "p",
        "x": "The obligations and liabilities of the parties incurred prior to the termination date shall survive the termination of this agreement for all purposes."
      },
      {
        "t": "h2",
        "x": "35. Legal Effectiveness"
      },
      {
        "t": "h3",
        "x": "35.1 Acknowledgment of Understanding"
      },
      {
        "t": "p",
        "x": "By using our Site and services, you acknowledge that you have read these Terms and Conditions and agree to be bound by them."
      }
    ]
  }
};
