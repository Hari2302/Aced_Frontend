import { apiRequest } from "./api";

export const getEmailTemplateByKey = async (templateKey) => {
  const attempts = [
    `/api/email-templates/${templateKey}`,
    `/api/email-templates?key=${encodeURIComponent(templateKey)}`,
    `/api/email-templates/by-key/${templateKey}`,
  ];

  for (const endpoint of attempts) {
    try {
      const data = await apiRequest(endpoint);
      if (Array.isArray(data)) return data[0] || null;
      if (Array.isArray(data?.data)) return data.data[0] || null;
      if (data?.data && !Array.isArray(data.data)) return data.data;
      return data || null;
    } catch (error) {
      // Try next endpoint pattern.
    }
  }

  return null;
};
