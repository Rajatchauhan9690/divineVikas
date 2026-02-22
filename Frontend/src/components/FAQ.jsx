import { useState } from "react";

const faqs = [
  {
    question: "Is it worth investing in the ONE DAY HEALING MASTER CLASS?",
    answer:
      "Absolutely. The MASTER CLASS is designed to give you practical frameworks, clarity, and actionable steps to build long-term success.",
  },
  {
    question: "How will I get the link to attend the program?",
    answer:
      "Once you register successfully, the joining link will be sent to your registered email ID before the session.",
  },
  {
    question: "I made the payment but didn’t receive any meeting link",
    answer:
      "If you still don’t find it, contact our support team with your payment details.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-10 mb-18">
      <div className="max-w-5xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-center text-4xl font-semibold mb-10">
          Frequently <span className="text-orange-500">Asked</span> Questions
        </h2>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl p-4">
              {/* Question */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-medium text-gray-800">
                  {faq.question}
                </h3>

                <span
                  className={`flex items-center justify-center flex-shrink-0 w-8 h-8  rounded-md text-white text-xl font-bold md:pb-1
                  ${openIndex === index ? "bg-gray-800" : "bg-orange-500"}`}
                >
                  {openIndex === index ? "−" : "+"}
                </span>
              </div>

              {/* Answer */}
              {openIndex === index && (
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
