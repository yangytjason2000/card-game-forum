"use client";

import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { SubscribeToSubforumPayload } from "@/lib/validators/subforum";
import axios, { AxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SubscribeLeaveToggleProps {
  subforumId: string;
  subforumName: string;
  isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
  subforumId,
  subforumName,
  isSubscribed,
}) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubforumPayload = {
        subforumId,
      };

      const { data } = await axios.post("/api/subforum/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Subscribed",
        description: `You are now subscribed to c/${subforumName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isUnSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubforumPayload = {
        subforumId,
      };

      const { data } = await axios.post("/api/subforum/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Unsubscribed",
        description: `You are now unsubscribed from c/${subforumName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      isLoading={isUnSubLoading}
      onClick={() => unsubscribe()}
      className="w-full mt-1 mb-4"
    >
      Leave Community
    </Button>
  ) : (
    <Button
      isLoading={isSubLoading}
      onClick={() => subscribe()}
      className="w-full mt-1 mb-4 "
    >
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;
