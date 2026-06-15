const consultationSubject = "Requesting a Free Consultation";
const consultationBody = `Hi Ryan,

I would like to speak with you regarding [fill in the blank].

Regards,
Your Name`;

export const consultationMailto = `mailto:ryan@frontiergtm.ai?subject=${encodeURIComponent(
  consultationSubject,
)}&body=${encodeURIComponent(consultationBody)}`;
