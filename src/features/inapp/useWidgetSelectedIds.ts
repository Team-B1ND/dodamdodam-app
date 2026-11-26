import { useSuspenseQuery } from "@tanstack/react-query";
import { inappQueryKeys } from "@entities/inapp/api/queryKeys";
import { widgetSelectionStorage } from "@entities/inapp/storage/widgetSelectionStorage";

export const useWidgetSelectedIdsSuspense = () => {
  const { data } = useSuspenseQuery({
    queryKey: inappQueryKeys.widgetSelectedIds,
    queryFn: widgetSelectionStorage.getSelectedIds,
    staleTime: Infinity,
  });

  return data;
};
