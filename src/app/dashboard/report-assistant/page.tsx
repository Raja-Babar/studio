import { generateReportRecommendations } from '@/ai/flows/generate-report-recommendations';
import { ReportAssistantForm } from './report-assistant-form';
import { pettyCashRecords, scanningProgressRecords } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ReportAssistantPage() {

  const initialRecommendations = await generateReportRecommendations({
    pettyCashRecords,
    scanningProgressRecords,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Generation Assistant</h1>
        <p className="text-muted-foreground mt-2">
          Use our AI assistant to analyze records and get recommendations for your reports.
        </p>
      </div>
      <ReportAssistantForm
        pettyCashRecords={pettyCashRecords}
        scanningProgressRecords={scanningProgressRecords}
        initialRecommendations={initialRecommendations}
      />
    </div>
  );
}
