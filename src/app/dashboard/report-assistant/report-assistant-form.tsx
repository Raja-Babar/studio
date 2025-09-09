'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getReportRecommendations } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import type { GenerateReportRecommendationsOutput } from '@/ai/flows/generate-report-recommendations';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  pettyCashRecords: z.string().min(10, {
    message: 'Petty cash records must be at least 10 characters.',
  }),
  scanningProgressRecords: z.string().min(10, {
    message: 'Scanning progress records must be at least 10 characters.',
  }),
});

type ReportAssistantFormProps = {
  pettyCashRecords: string;
  scanningProgressRecords: string;
  initialRecommendations: GenerateReportRecommendationsOutput | null;
}

export function ReportAssistantForm({ pettyCashRecords, scanningProgressRecords, initialRecommendations }: ReportAssistantFormProps) {
  const [recommendations, setRecommendations] = useState<GenerateReportRecommendationsOutput | null>(initialRecommendations);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pettyCashRecords: pettyCashRecords || '',
      scanningProgressRecords: scanningProgressRecords || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setRecommendations(null);

    const result = await getReportRecommendations(values);

    if (result.success) {
      setRecommendations(result.data);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Input Data</CardTitle>
          <CardDescription>
            Provide data from various records. You can use the pre-filled sample data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="pettyCashRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Petty Cash Records (JSON)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter petty cash records" {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scanningProgressRecords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scanning Progress Records (JSON)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter scanning progress records" {...field} rows={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Generate Recommendations'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {error && (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        
        {isLoading && <RecommendationsSkeleton />}

        {recommendations && (
            <div className="space-y-6 animate-in fade-in duration-500">
                <Card>
                    <CardHeader>
                        <CardTitle>Content Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none text-foreground">
                        <p>{recommendations.reportContentRecommendations}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Formatting Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-sm max-w-none text-foreground">
                        <p>{recommendations.reportFormattingRecommendations}</p>
                    </CardContent>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
}

function RecommendationsSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        </div>
    )
}
