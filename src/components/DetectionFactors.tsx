import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Building2, GitBranch, AlertTriangle, CheckCircle } from "lucide-react";

const DetectionFactors = () => {
  const factors = [
    {
      title: "Fake Volume Detection",
      description: "AI analysis of trading patterns to identify artificial volume inflation",
      icon: TrendingUp,
      risk: 85,
      status: "high",
      details: [
        "Suspicious wash trading patterns detected",
        "Volume spikes during low liquidity periods",
        "Coordinated bot activity identified"
      ]
    },
    {
      title: "Corporate Backing Analysis",
      description: "Verification of major companies and institutions supporting the project",
      icon: Building2,
      risk: 25,
      status: "low",
      details: [
        "3 verified enterprise partnerships",
        "Legitimate team with public profiles",
        "Transparent funding sources"
      ]
    },
    {
      title: "Sybil Attack Detection",
      description: "Identifying coordinated transactions and similar wallet patterns",
      icon: GitBranch,
      risk: 60,
      status: "medium",
      details: [
        "Multiple wallets with similar patterns",
        "Coordinated transaction timing",
        "Requires manual review"
      ]
    }
  ];

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "text-red-500";
    if (risk >= 40) return "text-yellow-500";
    return "text-green-500";
  };

  const getRiskBadge = (status: string) => {
    const colors = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-green-100 text-green-800"
    };
    return colors[status as keyof typeof colors];
  };

  return (
    <section id="detection-factors" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real-Time Risk Assessment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI-powered system analyzes three critical factors to determine rug pull probability
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {factors.map((factor, index) => {
            const Icon = factor.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-8 w-8 text-purple-600" />
                    <Badge className={getRiskBadge(factor.status)}>
                      {factor.status} risk
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{factor.title}</CardTitle>
                  <CardDescription>{factor.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Risk Level</span>
                      <span className={`text-sm font-bold ${getRiskColor(factor.risk)}`}>
                        {factor.risk}%
                      </span>
                    </div>
                    <Progress 
                      value={factor.risk} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    {factor.details.map((detail, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        {factor.status === "low" ? (
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        )}
                        <span className="text-sm text-gray-600">{detail}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DetectionFactors;
