import type { TextRef, ViewRef } from "@rn-primitives/types";
import * as React from "react";
import { Text, TextProps, View, ViewProps } from "react-native";
import { TextClassContext } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { CardLabel } from "~/components/ui/typography";

const Card = React.forwardRef<ViewRef, ViewProps>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("rounded-2xl border border-border bg-card shadow-md shadow-foreground/5", className)}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<ViewRef, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<TextRef, React.ComponentPropsWithoutRef<typeof Text>>(
  ({ className, ...props }, ref) => (
    <CardLabel role="heading" aria-level={3} ref={ref} className={cn(className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<TextRef, TextProps>(({ className, ...props }, ref) => (
  <Text ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<ViewRef, ViewProps>(({ className, ...props }, ref) => (
  <TextClassContext.Provider value="text-card-foreground">
    <View ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  </TextClassContext.Provider>
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<ViewRef, ViewProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn("flex flex-row items-center p-6 pt-4", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
