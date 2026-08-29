'use client';

import { useEffect } from 'react';

const FORM_ID = '3b37ce17-0835-4311-9592-cec41a160819';

type HubSpotFormInstance = {
  getFormId: () => string;
  setExtraSubmissionMetadata: (metadata: Record<string, string>) => void;
};

declare global {
  interface Window {
    HubSpotFormsV4?: {
      getFormFromEvent: (event: Event) => HubSpotFormInstance;
      getForms: () => HubSpotFormInstance[];
    };
  }
}

export function RushForm() {
  useEffect(() => {
    const markRushForm = (form: HubSpotFormInstance) => {
      if (form.getFormId() !== FORM_ID) return;
      form.setExtraSubmissionMetadata({
        program: 'FrontierGTM Rush',
        campaign: 'frontiergtm_rush_fall_2026',
        cohort: 'Fall 2026 Frontier AI Cohort',
        pageName: 'FrontierGTM Rush Application',
      });
    };

    const handleReady = (event: Event) => {
      const formApi = window.HubSpotFormsV4;
      if (!formApi) return;
      markRushForm(formApi.getFormFromEvent(event));
    };

    window.addEventListener('hs-form-event:on-ready', handleReady);
    window.HubSpotFormsV4?.getForms().forEach(markRushForm);

    return () => {
      window.removeEventListener('hs-form-event:on-ready', handleReady);
    };
  }, []);

  return (
    <div className="hubspot-form-wrap">
      <div
        className="hs-form-frame"
        data-region="na2"
        data-form-id={FORM_ID}
        data-portal-id="246863187"
      />
      <noscript>
        Please enable JavaScript to apply, or email{' '}
        <a href="mailto:ryan@frontiergtm.ai">ryan@frontiergtm.ai</a>.
      </noscript>
    </div>
  );
}
