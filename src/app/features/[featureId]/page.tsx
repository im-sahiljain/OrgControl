import React from "react";
import { notFound } from "next/navigation";
import { getFeatureById } from "@/lib/departmentRegistry";
import ComingSoon from "./ComingSoon";
import SalesPipeline from "./components/SalesPipeline";
import HrDirectory from "./components/HrDirectory";

export default async function FeatureShell({ params }: { params: Promise<{ featureId: string }> }) {
  const resolvedParams = await params;
  const featureId = resolvedParams.featureId;
  const feature = getFeatureById(featureId);
  
  if (!feature) {
    return notFound();
  }

  // Feature Component Router
  // As we build out functional components, we add them to this switch statement.
  switch (feature.id) {
    case "sales_pipeline":
      return <SalesPipeline feature={feature} />;
    case "hr_directory":
      return <HrDirectory feature={feature} />;
    
    
    
    default:
      // Graceful fallback for features that haven't been fully developed yet
      return <ComingSoon feature={feature} />;
  }
}
