"use client";

import { trpc } from "@/lib/trpc-client";
import { currency } from "@/lib/utils";
import { RouterOutput } from "@bingle/api";
import { AspectRatio } from "@bingle/ui/aspect-ratio";
import { Button } from "@bingle/ui/button";
import { Input } from "@bingle/ui/input";
import { cn } from "@bingle/ui/lib/utils";
import { useToast } from "@bingle/ui/use-toast";
import _ from "lodash";
import { CircleX } from "lucide-react";
import { Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function CartItem({
  item: {
    quantity,
    product: { id, name, description, price, images, stock },
  },
  className,
  onPending,
  onDone,
  disabled = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  item: RouterOutput["cart"]["list"][number];
  onPending?: () => void;
  onDone?: () => void;
  disabled?: boolean;
}) {
  const { toast } = useToast();
  const [validQty, setValidQty] = useState(quantity);
  const [localQty, setLocalQty] = useState(quantity);
  const utils = trpc.useUtils();

  const updateCart = trpc.cart.update.useMutation({
    onMutate: () => onPending && onPending(),
    onSuccess: (data) => {
      onDone && onDone();
      setValidQty(data[0]!.quantity);
      utils.cart.list.refetch();
    },
    onError: () => {
      onDone && onDone();
      setLocalQty(validQty);
      toast({
        variant: "destructive",
        title: "Failed to update cart",
        description: `Unable to update your cart. Try again later.`,
      });
    },
  });

  const removeFromCart = trpc.cart.remove.useMutation({
    onMutate: () => onPending && onPending(),
    onSuccess: () => {
      onDone && onDone();
      utils.cart.list.refetch();
      utils.product.find.refetch();
      toast({
        title: "Removed from cart",
        description: `"${name}" has been removed from your cart.`,
      });
    },
    onError: () => {
      onDone && onDone();
      toast({
        variant: "destructive",
        title: "There was a problem",
        description: `Couldn't remove "${name}" from your cart.`,
      });
    },
  });

  return (
    <div
      className={cn(
        "flex max-h-screen w-full flex-col justify-center py-3",
        className,
      )}
      key={id}
      {...props}
    >
      <div className="flex flex-row items-center justify-start">
        <div className="min-w-28">
          <AspectRatio ratio={1}>
            <Image
              src={images[0]!}
              alt={name}
              className="rounded-md object-cover"
              sizes="(min-width: 1024px) 11vw, (min-width: 768px) 16vw, (min-width: 640px) 19vw, (min-width: 475px) 24vw, 35vw"
              fill
              loading="lazy"
            />
          </AspectRatio>
        </div>
        <div className="flex w-full flex-col justify-start space-y-5 p-3 sm:p-6">
          <div className="flex flex-col space-y-2">
            <div className="flex flex-row items-center justify-between gap-1 sm:gap-2">
              <div className="sm:text-md font-semibold leading-none tracking-tight lg:text-xl">
                {name}
              </div>
              <CircleX
                onClick={() => !disabled && removeFromCart.mutate({ id })}
                className="size-4 flex-none cursor-pointer stroke-zinc-500 hover:stroke-red-900 sm:size-5"
              />
            </div>
            <h2 className="text-muted-foreground line-clamp-1 max-w-[90%] text-xs lg:text-sm">
              {description}
            </h2>
          </div>
          <div className="flex flex-col items-start justify-between gap-1 min-[382px]:flex-row min-[382px]:items-center sm:gap-3">
            <div className="flex flex-row items-center gap-1">
              <div className="lg:text-md text-accent-foreground line-clamp-1 flex items-center self-center p-0 pt-0 text-sm font-semibold">
                {currency.format(price)}
              </div>
              {quantity > 1 && (
                <div className="text-muted-foreground invisible text-xs md:visible">
                  x{quantity}
                </div>
              )}
            </div>
            <div className="flex flex-row">
              <Button
                id={`${id}-decrement`}
                variant="outline"
                disabled={disabled}
                size="icon"
                onClick={() => {
                  const quantity = Math.max(localQty - 1, 1);
                  setLocalQty(quantity);
                  updateCart.mutate({ items: [{ id, quantity }] });
                }}
                className="size-7 rounded-r-none md:size-8"
              >
                <Minus size={15} />
              </Button>
              <Input
                value={localQty === 0 ? "" : localQty}
                className="h-7 w-9 rounded-none border-x-0 text-center text-xs md:h-8 md:w-11 md:text-base"
                disabled={disabled}
                onChange={(e) => {
                  let quantity;
                  if (e.target.value === "") {
                    quantity = 0;
                  } else {
                    const parsed = parseInt(e.target.value);
                    if (!Number.isNaN(parsed)) {
                      quantity = _.clamp(parsed, 1, stock);
                    }
                  }
                  if (quantity) {
                    setLocalQty(quantity);
                    updateCart.mutate({ items: [{ id, quantity }] });
                  }
                }}
              />
              <Button
                id={`${id}-increment`}
                variant="outline"
                size="icon"
                className="size-7 rounded-l-none md:size-8"
                disabled={disabled}
                onClick={() => {
                  const quantity = Math.min(localQty + 1, stock);
                  setLocalQty(quantity);
                  updateCart.mutate({ items: [{ id, quantity }] });
                }}
              >
                <Plus size={15} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
