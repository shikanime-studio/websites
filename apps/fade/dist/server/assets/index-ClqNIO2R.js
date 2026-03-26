import { W as WriteStream, z as ReadStream, r as reactExports, n as jsxRuntimeExports, A as React, B as getAugmentedNamespace, D as getDefaultExportFromCjs, C as ClientOnly } from "./worker-entry-CH3j5ySW.js";
import { S as Subscribable, p as pendingThenable, r as resolveEnabled, s as shallowEqualObjects, a as resolveStaleTime, n as noop, e as environmentManager, i as isValidTimeout, t as timeUntilStale, b as timeoutManager, f as focusManager, c as fetchState, d as replaceData, g as notifyManager, h as shouldThrowError, u as useQueryClient, j as reactDomExports, k as discriminatedUnion, o as object, l as string, m as literal, _ as _enum, q as boolean, v as number, R as Route } from "./router-BRIDf2Ri.js";
import require$$1 from "util";
import require$$0$1 from "os";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const isatty = function() {
  return false;
};
const tty = {
  ReadStream,
  WriteStream,
  isatty
};
const tty$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ReadStream,
  WriteStream,
  default: tty,
  isatty
}, Symbol.toStringTag, { value: "Module" }));
var QueryObserver = class extends Subscribable {
  constructor(client, options) {
    super();
    this.options = options;
    this.#client = client;
    this.#selectError = null;
    this.#currentThenable = pendingThenable();
    this.bindMethods();
    this.setOptions(options);
  }
  #client;
  #currentQuery = void 0;
  #currentQueryInitialState = void 0;
  #currentResult = void 0;
  #currentResultState;
  #currentResultOptions;
  #currentThenable;
  #selectError;
  #selectFn;
  #selectResult;
  // This property keeps track of the last query with defined data.
  // It will be used to pass the previous data and query to the placeholder function between renders.
  #lastQueryWithDefinedData;
  #staleTimeoutId;
  #refetchIntervalId;
  #currentRefetchInterval;
  #trackedProps = /* @__PURE__ */ new Set();
  bindMethods() {
    this.refetch = this.refetch.bind(this);
  }
  onSubscribe() {
    if (this.listeners.size === 1) {
      this.#currentQuery.addObserver(this);
      if (shouldFetchOnMount(this.#currentQuery, this.options)) {
        this.#executeFetch();
      } else {
        this.updateResult();
      }
      this.#updateTimers();
    }
  }
  onUnsubscribe() {
    if (!this.hasListeners()) {
      this.destroy();
    }
  }
  shouldFetchOnReconnect() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnReconnect
    );
  }
  shouldFetchOnWindowFocus() {
    return shouldFetchOn(
      this.#currentQuery,
      this.options,
      this.options.refetchOnWindowFocus
    );
  }
  destroy() {
    this.listeners = /* @__PURE__ */ new Set();
    this.#clearStaleTimeout();
    this.#clearRefetchInterval();
    this.#currentQuery.removeObserver(this);
  }
  setOptions(options) {
    const prevOptions = this.options;
    const prevQuery = this.#currentQuery;
    this.options = this.#client.defaultQueryOptions(options);
    if (this.options.enabled !== void 0 && typeof this.options.enabled !== "boolean" && typeof this.options.enabled !== "function" && typeof resolveEnabled(this.options.enabled, this.#currentQuery) !== "boolean") {
      throw new Error(
        "Expected enabled to be a boolean or a callback that returns a boolean"
      );
    }
    this.#updateQuery();
    this.#currentQuery.setOptions(this.options);
    if (prevOptions._defaulted && !shallowEqualObjects(this.options, prevOptions)) {
      this.#client.getQueryCache().notify({
        type: "observerOptionsUpdated",
        query: this.#currentQuery,
        observer: this
      });
    }
    const mounted = this.hasListeners();
    if (mounted && shouldFetchOptionally(
      this.#currentQuery,
      prevQuery,
      this.options,
      prevOptions
    )) {
      this.#executeFetch();
    }
    this.updateResult();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || resolveStaleTime(this.options.staleTime, this.#currentQuery) !== resolveStaleTime(prevOptions.staleTime, this.#currentQuery))) {
      this.#updateStaleTimeout();
    }
    const nextRefetchInterval = this.#computeRefetchInterval();
    if (mounted && (this.#currentQuery !== prevQuery || resolveEnabled(this.options.enabled, this.#currentQuery) !== resolveEnabled(prevOptions.enabled, this.#currentQuery) || nextRefetchInterval !== this.#currentRefetchInterval)) {
      this.#updateRefetchInterval(nextRefetchInterval);
    }
  }
  getOptimisticResult(options) {
    const query = this.#client.getQueryCache().build(this.#client, options);
    const result = this.createResult(query, options);
    if (shouldAssignObserverCurrentProperties(this, result)) {
      this.#currentResult = result;
      this.#currentResultOptions = this.options;
      this.#currentResultState = this.#currentQuery.state;
    }
    return result;
  }
  getCurrentResult() {
    return this.#currentResult;
  }
  trackResult(result, onPropTracked) {
    return new Proxy(result, {
      get: (target, key) => {
        this.trackProp(key);
        onPropTracked?.(key);
        if (key === "promise") {
          this.trackProp("data");
          if (!this.options.experimental_prefetchInRender && this.#currentThenable.status === "pending") {
            this.#currentThenable.reject(
              new Error(
                "experimental_prefetchInRender feature flag is not enabled"
              )
            );
          }
        }
        return Reflect.get(target, key);
      }
    });
  }
  trackProp(key) {
    this.#trackedProps.add(key);
  }
  getCurrentQuery() {
    return this.#currentQuery;
  }
  refetch({ ...options } = {}) {
    return this.fetch({
      ...options
    });
  }
  fetchOptimistic(options) {
    const defaultedOptions = this.#client.defaultQueryOptions(options);
    const query = this.#client.getQueryCache().build(this.#client, defaultedOptions);
    return query.fetch().then(() => this.createResult(query, defaultedOptions));
  }
  fetch(fetchOptions) {
    return this.#executeFetch({
      ...fetchOptions,
      cancelRefetch: fetchOptions.cancelRefetch ?? true
    }).then(() => {
      this.updateResult();
      return this.#currentResult;
    });
  }
  #executeFetch(fetchOptions) {
    this.#updateQuery();
    let promise = this.#currentQuery.fetch(
      this.options,
      fetchOptions
    );
    if (!fetchOptions?.throwOnError) {
      promise = promise.catch(noop);
    }
    return promise;
  }
  #updateStaleTimeout() {
    this.#clearStaleTimeout();
    const staleTime = resolveStaleTime(
      this.options.staleTime,
      this.#currentQuery
    );
    if (environmentManager.isServer() || this.#currentResult.isStale || !isValidTimeout(staleTime)) {
      return;
    }
    const time = timeUntilStale(this.#currentResult.dataUpdatedAt, staleTime);
    const timeout = time + 1;
    this.#staleTimeoutId = timeoutManager.setTimeout(() => {
      if (!this.#currentResult.isStale) {
        this.updateResult();
      }
    }, timeout);
  }
  #computeRefetchInterval() {
    return (typeof this.options.refetchInterval === "function" ? this.options.refetchInterval(this.#currentQuery) : this.options.refetchInterval) ?? false;
  }
  #updateRefetchInterval(nextInterval) {
    this.#clearRefetchInterval();
    this.#currentRefetchInterval = nextInterval;
    if (environmentManager.isServer() || resolveEnabled(this.options.enabled, this.#currentQuery) === false || !isValidTimeout(this.#currentRefetchInterval) || this.#currentRefetchInterval === 0) {
      return;
    }
    this.#refetchIntervalId = timeoutManager.setInterval(() => {
      if (this.options.refetchIntervalInBackground || focusManager.isFocused()) {
        this.#executeFetch();
      }
    }, this.#currentRefetchInterval);
  }
  #updateTimers() {
    this.#updateStaleTimeout();
    this.#updateRefetchInterval(this.#computeRefetchInterval());
  }
  #clearStaleTimeout() {
    if (this.#staleTimeoutId) {
      timeoutManager.clearTimeout(this.#staleTimeoutId);
      this.#staleTimeoutId = void 0;
    }
  }
  #clearRefetchInterval() {
    if (this.#refetchIntervalId) {
      timeoutManager.clearInterval(this.#refetchIntervalId);
      this.#refetchIntervalId = void 0;
    }
  }
  createResult(query, options) {
    const prevQuery = this.#currentQuery;
    const prevOptions = this.options;
    const prevResult = this.#currentResult;
    const prevResultState = this.#currentResultState;
    const prevResultOptions = this.#currentResultOptions;
    const queryChange = query !== prevQuery;
    const queryInitialState = queryChange ? query.state : this.#currentQueryInitialState;
    const { state } = query;
    let newState = { ...state };
    let isPlaceholderData = false;
    let data;
    if (options._optimisticResults) {
      const mounted = this.hasListeners();
      const fetchOnMount = !mounted && shouldFetchOnMount(query, options);
      const fetchOptionally = mounted && shouldFetchOptionally(query, prevQuery, options, prevOptions);
      if (fetchOnMount || fetchOptionally) {
        newState = {
          ...newState,
          ...fetchState(state.data, query.options)
        };
      }
      if (options._optimisticResults === "isRestoring") {
        newState.fetchStatus = "idle";
      }
    }
    let { error, errorUpdatedAt, status } = newState;
    data = newState.data;
    let skipSelect = false;
    if (options.placeholderData !== void 0 && data === void 0 && status === "pending") {
      let placeholderData;
      if (prevResult?.isPlaceholderData && options.placeholderData === prevResultOptions?.placeholderData) {
        placeholderData = prevResult.data;
        skipSelect = true;
      } else {
        placeholderData = typeof options.placeholderData === "function" ? options.placeholderData(
          this.#lastQueryWithDefinedData?.state.data,
          this.#lastQueryWithDefinedData
        ) : options.placeholderData;
      }
      if (placeholderData !== void 0) {
        status = "success";
        data = replaceData(
          prevResult?.data,
          placeholderData,
          options
        );
        isPlaceholderData = true;
      }
    }
    if (options.select && data !== void 0 && !skipSelect) {
      if (prevResult && data === prevResultState?.data && options.select === this.#selectFn) {
        data = this.#selectResult;
      } else {
        try {
          this.#selectFn = options.select;
          data = options.select(data);
          data = replaceData(prevResult?.data, data, options);
          this.#selectResult = data;
          this.#selectError = null;
        } catch (selectError) {
          this.#selectError = selectError;
        }
      }
    }
    if (this.#selectError) {
      error = this.#selectError;
      data = this.#selectResult;
      errorUpdatedAt = Date.now();
      status = "error";
    }
    const isFetching = newState.fetchStatus === "fetching";
    const isPending = status === "pending";
    const isError = status === "error";
    const isLoading = isPending && isFetching;
    const hasData = data !== void 0;
    const result = {
      status,
      fetchStatus: newState.fetchStatus,
      isPending,
      isSuccess: status === "success",
      isError,
      isInitialLoading: isLoading,
      isLoading,
      data,
      dataUpdatedAt: newState.dataUpdatedAt,
      error,
      errorUpdatedAt,
      failureCount: newState.fetchFailureCount,
      failureReason: newState.fetchFailureReason,
      errorUpdateCount: newState.errorUpdateCount,
      isFetched: query.isFetched(),
      isFetchedAfterMount: newState.dataUpdateCount > queryInitialState.dataUpdateCount || newState.errorUpdateCount > queryInitialState.errorUpdateCount,
      isFetching,
      isRefetching: isFetching && !isPending,
      isLoadingError: isError && !hasData,
      isPaused: newState.fetchStatus === "paused",
      isPlaceholderData,
      isRefetchError: isError && hasData,
      isStale: isStale(query, options),
      refetch: this.refetch,
      promise: this.#currentThenable,
      isEnabled: resolveEnabled(options.enabled, query) !== false
    };
    const nextResult = result;
    if (this.options.experimental_prefetchInRender) {
      const hasResultData = nextResult.data !== void 0;
      const isErrorWithoutData = nextResult.status === "error" && !hasResultData;
      const finalizeThenableIfPossible = (thenable) => {
        if (isErrorWithoutData) {
          thenable.reject(nextResult.error);
        } else if (hasResultData) {
          thenable.resolve(nextResult.data);
        }
      };
      const recreateThenable = () => {
        const pending = this.#currentThenable = nextResult.promise = pendingThenable();
        finalizeThenableIfPossible(pending);
      };
      const prevThenable = this.#currentThenable;
      switch (prevThenable.status) {
        case "pending":
          if (query.queryHash === prevQuery.queryHash) {
            finalizeThenableIfPossible(prevThenable);
          }
          break;
        case "fulfilled":
          if (isErrorWithoutData || nextResult.data !== prevThenable.value) {
            recreateThenable();
          }
          break;
        case "rejected":
          if (!isErrorWithoutData || nextResult.error !== prevThenable.reason) {
            recreateThenable();
          }
          break;
      }
    }
    return nextResult;
  }
  updateResult() {
    const prevResult = this.#currentResult;
    const nextResult = this.createResult(this.#currentQuery, this.options);
    this.#currentResultState = this.#currentQuery.state;
    this.#currentResultOptions = this.options;
    if (this.#currentResultState.data !== void 0) {
      this.#lastQueryWithDefinedData = this.#currentQuery;
    }
    if (shallowEqualObjects(nextResult, prevResult)) {
      return;
    }
    this.#currentResult = nextResult;
    const shouldNotifyListeners = () => {
      if (!prevResult) {
        return true;
      }
      const { notifyOnChangeProps } = this.options;
      const notifyOnChangePropsValue = typeof notifyOnChangeProps === "function" ? notifyOnChangeProps() : notifyOnChangeProps;
      if (notifyOnChangePropsValue === "all" || !notifyOnChangePropsValue && !this.#trackedProps.size) {
        return true;
      }
      const includedProps = new Set(
        notifyOnChangePropsValue ?? this.#trackedProps
      );
      if (this.options.throwOnError) {
        includedProps.add("error");
      }
      return Object.keys(this.#currentResult).some((key) => {
        const typedKey = key;
        const changed = this.#currentResult[typedKey] !== prevResult[typedKey];
        return changed && includedProps.has(typedKey);
      });
    };
    this.#notify({ listeners: shouldNotifyListeners() });
  }
  #updateQuery() {
    const query = this.#client.getQueryCache().build(this.#client, this.options);
    if (query === this.#currentQuery) {
      return;
    }
    const prevQuery = this.#currentQuery;
    this.#currentQuery = query;
    this.#currentQueryInitialState = query.state;
    if (this.hasListeners()) {
      prevQuery?.removeObserver(this);
      query.addObserver(this);
    }
  }
  onQueryUpdate() {
    this.updateResult();
    if (this.hasListeners()) {
      this.#updateTimers();
    }
  }
  #notify(notifyOptions) {
    notifyManager.batch(() => {
      if (notifyOptions.listeners) {
        this.listeners.forEach((listener) => {
          listener(this.#currentResult);
        });
      }
      this.#client.getQueryCache().notify({
        query: this.#currentQuery,
        type: "observerResultsUpdated"
      });
    });
  }
};
function shouldLoadOnMount(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.state.data === void 0 && !(query.state.status === "error" && options.retryOnMount === false);
}
function shouldFetchOnMount(query, options) {
  return shouldLoadOnMount(query, options) || query.state.data !== void 0 && shouldFetchOn(query, options, options.refetchOnMount);
}
function shouldFetchOn(query, options, field) {
  if (resolveEnabled(options.enabled, query) !== false && resolveStaleTime(options.staleTime, query) !== "static") {
    const value = typeof field === "function" ? field(query) : field;
    return value === "always" || value !== false && isStale(query, options);
  }
  return false;
}
function shouldFetchOptionally(query, prevQuery, options, prevOptions) {
  return (query !== prevQuery || resolveEnabled(prevOptions.enabled, query) === false) && (!options.suspense || query.state.status !== "error") && isStale(query, options);
}
function isStale(query, options) {
  return resolveEnabled(options.enabled, query) !== false && query.isStaleByTime(resolveStaleTime(options.staleTime, query));
}
function shouldAssignObserverCurrentProperties(observer, optimisticResult) {
  if (!shallowEqualObjects(observer.getCurrentResult(), optimisticResult)) {
    return true;
  }
  return false;
}
var IsRestoringContext = reactExports.createContext(false);
var useIsRestoring = () => reactExports.useContext(IsRestoringContext);
IsRestoringContext.Provider;
function createValue() {
  let isReset = false;
  return {
    clearReset: () => {
      isReset = false;
    },
    reset: () => {
      isReset = true;
    },
    isReset: () => {
      return isReset;
    }
  };
}
var QueryErrorResetBoundaryContext = reactExports.createContext(createValue());
var useQueryErrorResetBoundary = () => reactExports.useContext(QueryErrorResetBoundaryContext);
var ensurePreventErrorBoundaryRetry = (options, errorResetBoundary, query) => {
  const throwOnError = query?.state.error && typeof options.throwOnError === "function" ? shouldThrowError(options.throwOnError, [query.state.error, query]) : options.throwOnError;
  if (options.suspense || options.experimental_prefetchInRender || throwOnError) {
    if (!errorResetBoundary.isReset()) {
      options.retryOnMount = false;
    }
  }
};
var useClearResetErrorBoundary = (errorResetBoundary) => {
  reactExports.useEffect(() => {
    errorResetBoundary.clearReset();
  }, [errorResetBoundary]);
};
var getHasError = ({
  result,
  errorResetBoundary,
  throwOnError,
  query,
  suspense
}) => {
  return result.isError && !errorResetBoundary.isReset() && !result.isFetching && query && (suspense && result.data === void 0 || shouldThrowError(throwOnError, [result.error, query]));
};
var defaultThrowOnError = (_error, query) => query.state.data === void 0;
var ensureSuspenseTimers = (defaultedOptions) => {
  if (defaultedOptions.suspense) {
    const MIN_SUSPENSE_TIME_MS = 1e3;
    const clamp = (value) => value === "static" ? value : Math.max(value ?? MIN_SUSPENSE_TIME_MS, MIN_SUSPENSE_TIME_MS);
    const originalStaleTime = defaultedOptions.staleTime;
    defaultedOptions.staleTime = typeof originalStaleTime === "function" ? (...args) => clamp(originalStaleTime(...args)) : clamp(originalStaleTime);
    if (typeof defaultedOptions.gcTime === "number") {
      defaultedOptions.gcTime = Math.max(
        defaultedOptions.gcTime,
        MIN_SUSPENSE_TIME_MS
      );
    }
  }
};
var willFetch = (result, isRestoring) => result.isLoading && result.isFetching && !isRestoring;
var shouldSuspend = (defaultedOptions, result) => defaultedOptions?.suspense && result.isPending;
var fetchOptimistic = (defaultedOptions, observer, errorResetBoundary) => observer.fetchOptimistic(defaultedOptions).catch(() => {
  errorResetBoundary.clearReset();
});
function useBaseQuery(options, Observer, queryClient) {
  const isRestoring = useIsRestoring();
  const errorResetBoundary = useQueryErrorResetBoundary();
  const client = useQueryClient();
  const defaultedOptions = client.defaultQueryOptions(options);
  client.getDefaultOptions().queries?._experimental_beforeQuery?.(
    defaultedOptions
  );
  const query = client.getQueryCache().get(defaultedOptions.queryHash);
  defaultedOptions._optimisticResults = isRestoring ? "isRestoring" : "optimistic";
  ensureSuspenseTimers(defaultedOptions);
  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary, query);
  useClearResetErrorBoundary(errorResetBoundary);
  const isNewCacheEntry = !client.getQueryCache().get(defaultedOptions.queryHash);
  const [observer] = reactExports.useState(
    () => new Observer(
      client,
      defaultedOptions
    )
  );
  const result = observer.getOptimisticResult(defaultedOptions);
  const shouldSubscribe = !isRestoring && options.subscribed !== false;
  reactExports.useSyncExternalStore(
    reactExports.useCallback(
      (onStoreChange) => {
        const unsubscribe = shouldSubscribe ? observer.subscribe(notifyManager.batchCalls(onStoreChange)) : noop;
        observer.updateResult();
        return unsubscribe;
      },
      [observer, shouldSubscribe]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );
  reactExports.useEffect(() => {
    observer.setOptions(defaultedOptions);
  }, [defaultedOptions, observer]);
  if (shouldSuspend(defaultedOptions, result)) {
    throw fetchOptimistic(defaultedOptions, observer, errorResetBoundary);
  }
  if (getHasError({
    result,
    errorResetBoundary,
    throwOnError: defaultedOptions.throwOnError,
    query,
    suspense: defaultedOptions.suspense
  })) {
    throw result.error;
  }
  client.getDefaultOptions().queries?._experimental_afterQuery?.(
    defaultedOptions,
    result
  );
  if (defaultedOptions.experimental_prefetchInRender && !environmentManager.isServer() && willFetch(result, isRestoring)) {
    const promise = isNewCacheEntry ? (
      // Fetch immediately on render in order to ensure `.promise` is resolved even if the component is unmounted
      fetchOptimistic(defaultedOptions, observer, errorResetBoundary)
    ) : (
      // subscribe to the "cache promise" so that we can finalize the currentThenable once data comes in
      query?.promise
    );
    promise?.catch(noop).finally(() => {
      observer.updateResult();
    });
  }
  return !defaultedOptions.notifyOnChangeProps ? observer.trackResult(result) : result;
}
function useSuspenseQuery(options, queryClient) {
  return useBaseQuery(
    {
      ...options,
      enabled: true,
      suspense: true,
      throwOnError: defaultThrowOnError,
      placeholderData: void 0
    },
    QueryObserver
  );
}
const GpuAdapterContext = reactExports.createContext(null);
const GpuDeviceContext = reactExports.createContext(null);
function useGpuAdapter() {
  return reactExports.use(GpuAdapterContext);
}
function useGpuDevice() {
  const adapter = useGpuAdapter();
  const device = reactExports.use(GpuDeviceContext);
  return {
    adapter,
    device
  };
}
function useGPUSupport() {
  return reactExports.useMemo(() => {
    return typeof navigator !== "undefined" && "gpu" in navigator;
  }, []);
}
function useGpuFormat() {
  const isSupported = useGPUSupport();
  return reactExports.useMemo(() => {
    if (!isSupported)
      return null;
    return navigator.gpu.getPreferredCanvasFormat();
  }, [isSupported]);
}
function GpuAdapterProvider({
  children,
  options
}) {
  const isSupported = useGPUSupport();
  const { data: adapter } = useSuspenseQuery({
    queryKey: ["gpu", "adapter", isSupported, options],
    queryFn: async () => {
      if (!isSupported)
        return null;
      return await navigator.gpu.requestAdapter(options);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GpuAdapterContext, { value: adapter, children });
}
function GpuDeviceProvider({
  children,
  options
}) {
  const queryClient = useQueryClient();
  const adapter = useGpuAdapter();
  const { data: device } = useSuspenseQuery({
    queryKey: ["gpu", "device", adapter, options],
    queryFn: async () => {
      if (!adapter)
        return null;
      return await adapter.requestDevice(options);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false
  });
  reactExports.useEffect(() => {
    if (!device)
      return;
    device.lost.then(() => {
      return queryClient.invalidateQueries({
        queryKey: ["gpu", "device", adapter, options]
      });
    }).catch(() => {
      return queryClient.invalidateQueries({
        queryKey: ["gpu", "device", adapter, options]
      });
    });
  }, [device, queryClient, adapter, options]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GpuDeviceContext, { value: device, children });
}
const DirectoryContext = reactExports.createContext(
  null
);
function useDirectory() {
  const context = reactExports.use(DirectoryContext);
  if (!context) {
    throw new Error("useDirectory must be used within a DirectoryProvider");
  }
  return context;
}
function useFileSystemSupport() {
  return reactExports.useMemo(() => {
    return typeof window !== "undefined" && "showDirectoryPicker" in window;
  }, []);
}
function DirectoryProvider({ children }) {
  const [handle, setHandle] = reactExports.useState(null);
  const isSupported = useFileSystemSupport();
  const select = reactExports.useCallback(async () => {
    try {
      if (!isSupported) {
        console.warn(
          "Your browser does not support opening local directories."
        );
        return;
      }
      const dirHandle = await window.showDirectoryPicker();
      setHandle(dirHandle);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error(
          "Failed to open directory. Please try again or choose a different one."
        );
      }
    }
  }, [isSupported]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DirectoryContext,
    {
      value: {
        handle,
        select,
        isSupported
      },
      children
    }
  );
}
class BaseExpression {
}
class CollectionRef extends BaseExpression {
  constructor(collection, alias) {
    super();
    this.collection = collection;
    this.alias = alias;
    this.type = `collectionRef`;
  }
}
class QueryRef extends BaseExpression {
  constructor(query, alias) {
    super();
    this.query = query;
    this.alias = alias;
    this.type = `queryRef`;
  }
}
class PropRef extends BaseExpression {
  constructor(path) {
    super();
    this.path = path;
    this.type = `ref`;
  }
}
class Value extends BaseExpression {
  constructor(value) {
    super();
    this.value = value;
    this.type = `val`;
  }
}
class Func extends BaseExpression {
  constructor(name, args) {
    super();
    this.name = name;
    this.args = args;
    this.type = `func`;
  }
}
class Aggregate extends BaseExpression {
  constructor(name, args) {
    super();
    this.name = name;
    this.args = args;
    this.type = `agg`;
  }
}
function isExpressionLike(value) {
  return value instanceof Aggregate || value instanceof Func || value instanceof PropRef || value instanceof Value;
}
function getWhereExpression(where) {
  return typeof where === `object` && `expression` in where ? where.expression : where;
}
function getHavingExpression(having) {
  return typeof having === `object` && `expression` in having ? having.expression : having;
}
function isResidualWhere(where) {
  return typeof where === `object` && `expression` in where && where.residual === true;
}
function createResidualWhere(expression) {
  return { expression, residual: true };
}
function getRefFromAlias(query, alias) {
  if (query.from.alias === alias) {
    return query.from;
  }
  for (const join2 of query.join || []) {
    if (join2.from.alias === alias) {
      return join2.from;
    }
  }
}
function followRef(query, ref, collection) {
  if (ref.path.length === 0) {
    return;
  }
  if (ref.path.length === 1) {
    const field = ref.path[0];
    if (query.select) {
      const selectedField = query.select[field];
      if (selectedField && selectedField.type === `ref`) {
        return followRef(query, selectedField, collection);
      }
    }
    return { collection, path: [field] };
  }
  if (ref.path.length > 1) {
    const [alias, ...rest] = ref.path;
    const aliasRef = getRefFromAlias(query, alias);
    if (!aliasRef) {
      return;
    }
    if (aliasRef.type === `queryRef`) {
      return followRef(aliasRef.query, new PropRef(rest), collection);
    } else {
      return { collection: aliasRef.collection, path: rest };
    }
  }
}
class TanStackDBError extends Error {
  constructor(message) {
    super(message);
    this.name = `TanStackDBError`;
  }
}
class SchemaValidationError extends TanStackDBError {
  constructor(type, issues, message) {
    const defaultMessage = `${type === `insert` ? `Insert` : `Update`} validation failed: ${issues.map((issue) => `
- ${issue.message} - path: ${issue.path}`).join(``)}`;
    super(message || defaultMessage);
    this.name = `SchemaValidationError`;
    this.type = type;
    this.issues = issues;
  }
}
class CollectionConfigurationError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `CollectionConfigurationError`;
  }
}
class CollectionRequiresConfigError extends CollectionConfigurationError {
  constructor() {
    super(`Collection requires a config`);
  }
}
class CollectionRequiresSyncConfigError extends CollectionConfigurationError {
  constructor() {
    super(`Collection requires a sync config`);
  }
}
class InvalidSchemaError extends CollectionConfigurationError {
  constructor() {
    super(`Schema must implement the standard-schema interface`);
  }
}
class SchemaMustBeSynchronousError extends CollectionConfigurationError {
  constructor() {
    super(`Schema validation must be synchronous`);
  }
}
class CollectionStateError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `CollectionStateError`;
  }
}
class CollectionInErrorStateError extends CollectionStateError {
  constructor(operation, collectionId) {
    super(
      `Cannot perform ${operation} on collection "${collectionId}" - collection is in error state. Try calling cleanup() and restarting the collection.`
    );
  }
}
class InvalidCollectionStatusTransitionError extends CollectionStateError {
  constructor(from, to, collectionId) {
    super(
      `Invalid collection status transition from "${from}" to "${to}" for collection "${collectionId}"`
    );
  }
}
class CollectionIsInErrorStateError extends CollectionStateError {
  constructor() {
    super(`Collection is in error state`);
  }
}
class NegativeActiveSubscribersError extends CollectionStateError {
  constructor() {
    super(`Active subscribers count is negative - this should never happen`);
  }
}
class CollectionOperationError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `CollectionOperationError`;
  }
}
class UndefinedKeyError extends CollectionOperationError {
  constructor(item) {
    super(
      `An object was created without a defined key: ${JSON.stringify(item)}`
    );
  }
}
class InvalidKeyError extends CollectionOperationError {
  constructor(key, item) {
    const keyType = key === null ? `null` : typeof key;
    super(
      `getKey returned an invalid key type. Expected string or number, but got ${keyType}: ${JSON.stringify(key)}. Item: ${JSON.stringify(item)}`
    );
  }
}
class DuplicateKeyError extends CollectionOperationError {
  constructor(key) {
    super(
      `Cannot insert document with ID "${key}" because it already exists in the collection`
    );
  }
}
class DuplicateKeySyncError extends CollectionOperationError {
  constructor(key, collectionId, options) {
    const baseMessage = `Cannot insert document with key "${key}" from sync because it already exists in the collection "${collectionId}"`;
    if (options?.hasCustomGetKey && options.hasDistinct) {
      super(
        `${baseMessage}. This collection uses a custom getKey with .distinct(). The .distinct() operator deduplicates by the ENTIRE selected object (standard SQL behavior), but your custom getKey extracts only a subset of fields. This causes multiple distinct rows (with different values in non-key fields) to receive the same key. To fix this, either: (1) ensure your SELECT only includes fields that uniquely identify each row, (2) use .groupBy() with min()/max() aggregates to select one value per group, or (3) remove the custom getKey to use the default key behavior.`
      );
    } else if (options?.hasCustomGetKey && options.hasJoins) {
      super(
        `${baseMessage}. This collection uses a custom getKey with joined queries. Joined queries can produce multiple rows with the same key when relationships are not 1:1. Consider: (1) using a composite key in your getKey function (e.g., \`\${item.key1}-\${item.key2}\`), (2) ensuring your join produces unique rows per key, or (3) removing the custom getKey to use the default composite key behavior.`
      );
    } else {
      super(baseMessage);
    }
  }
}
class MissingUpdateArgumentError extends CollectionOperationError {
  constructor() {
    super(`The first argument to update is missing`);
  }
}
class NoKeysPassedToUpdateError extends CollectionOperationError {
  constructor() {
    super(`No keys were passed to update`);
  }
}
class UpdateKeyNotFoundError extends CollectionOperationError {
  constructor(key) {
    super(
      `The key "${key}" was passed to update but an object for this key was not found in the collection`
    );
  }
}
class KeyUpdateNotAllowedError extends CollectionOperationError {
  constructor(originalKey, newKey) {
    super(
      `Updating the key of an item is not allowed. Original key: "${originalKey}", Attempted new key: "${newKey}". Please delete the old item and create a new one if a key change is necessary.`
    );
  }
}
class NoKeysPassedToDeleteError extends CollectionOperationError {
  constructor() {
    super(`No keys were passed to delete`);
  }
}
class DeleteKeyNotFoundError extends CollectionOperationError {
  constructor(key) {
    super(
      `Collection.delete was called with key '${key}' but there is no item in the collection with this key`
    );
  }
}
class MissingHandlerError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `MissingHandlerError`;
  }
}
class MissingInsertHandlerError extends MissingHandlerError {
  constructor() {
    super(
      `Collection.insert called directly (not within an explicit transaction) but no 'onInsert' handler is configured.`
    );
  }
}
class MissingUpdateHandlerError extends MissingHandlerError {
  constructor() {
    super(
      `Collection.update called directly (not within an explicit transaction) but no 'onUpdate' handler is configured.`
    );
  }
}
class MissingDeleteHandlerError extends MissingHandlerError {
  constructor() {
    super(
      `Collection.delete called directly (not within an explicit transaction) but no 'onDelete' handler is configured.`
    );
  }
}
class TransactionError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `TransactionError`;
  }
}
class MissingMutationFunctionError extends TransactionError {
  constructor() {
    super(`mutationFn is required when creating a transaction`);
  }
}
class TransactionNotPendingMutateError extends TransactionError {
  constructor() {
    super(
      `You can no longer call .mutate() as the transaction is no longer pending`
    );
  }
}
class TransactionAlreadyCompletedRollbackError extends TransactionError {
  constructor() {
    super(
      `You can no longer call .rollback() as the transaction is already completed`
    );
  }
}
class TransactionNotPendingCommitError extends TransactionError {
  constructor() {
    super(
      `You can no longer call .commit() as the transaction is no longer pending`
    );
  }
}
class NoPendingSyncTransactionWriteError extends TransactionError {
  constructor() {
    super(`No pending sync transaction to write to`);
  }
}
class SyncTransactionAlreadyCommittedWriteError extends TransactionError {
  constructor() {
    super(
      `The pending sync transaction is already committed, you can't still write to it.`
    );
  }
}
class NoPendingSyncTransactionCommitError extends TransactionError {
  constructor() {
    super(`No pending sync transaction to commit`);
  }
}
class SyncTransactionAlreadyCommittedError extends TransactionError {
  constructor() {
    super(
      `The pending sync transaction is already committed, you can't commit it again.`
    );
  }
}
class QueryBuilderError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `QueryBuilderError`;
  }
}
class OnlyOneSourceAllowedError extends QueryBuilderError {
  constructor(context) {
    super(`Only one source is allowed in the ${context}`);
  }
}
class SubQueryMustHaveFromClauseError extends QueryBuilderError {
  constructor(context) {
    super(`A sub query passed to a ${context} must have a from clause itself`);
  }
}
class InvalidSourceError extends QueryBuilderError {
  constructor(alias) {
    super(
      `Invalid source for live query: The value provided for alias "${alias}" is not a Collection or subquery. Live queries only accept Collection instances or subqueries. Please ensure you're passing a valid Collection or QueryBuilder, not a plain array or other data type.`
    );
  }
}
class InvalidSourceTypeError extends QueryBuilderError {
  constructor(context, type) {
    super(
      `Invalid source for ${context}: Expected an object with a single key-value pair like { alias: collection }. For example: .from({ todos: todosCollection }). Got: ${type}`
    );
  }
}
class JoinConditionMustBeEqualityError extends QueryBuilderError {
  constructor() {
    super(`Join condition must be an equality expression`);
  }
}
class QueryMustHaveFromClauseError extends QueryBuilderError {
  constructor() {
    super(`Query must have a from clause`);
  }
}
class InvalidWhereExpressionError extends QueryBuilderError {
  constructor(valueType) {
    super(
      `Invalid where() expression: Expected a query expression, but received a ${valueType}. This usually happens when using JavaScript's comparison operators (===, !==, <, >, etc.) directly. Instead, use the query builder functions:

  ❌ .where(({ user }) => user.id === 'abc')
  ✅ .where(({ user }) => eq(user.id, 'abc'))

Available comparison functions: eq, gt, gte, lt, lte, and, or, not, like, ilike, isNull, isUndefined`
    );
  }
}
class QueryCompilationError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `QueryCompilationError`;
  }
}
class DistinctRequiresSelectError extends QueryCompilationError {
  constructor() {
    super(`DISTINCT requires a SELECT clause.`);
  }
}
class FnSelectWithGroupByError extends QueryCompilationError {
  constructor() {
    super(
      `fn.select() cannot be used with groupBy(). groupBy requires the compiler to statically analyze aggregate functions (count, sum, max, etc.) in the SELECT clause, which is not possible with fn.select() since it is an opaque function. Use .select() instead of .fn.select() when combining with groupBy().`
    );
  }
}
class HavingRequiresGroupByError extends QueryCompilationError {
  constructor() {
    super(`HAVING clause requires GROUP BY clause`);
  }
}
class LimitOffsetRequireOrderByError extends QueryCompilationError {
  constructor() {
    super(
      `LIMIT and OFFSET require an ORDER BY clause to ensure deterministic results`
    );
  }
}
class CollectionInputNotFoundError extends QueryCompilationError {
  constructor(alias, collectionId, availableKeys) {
    const details = collectionId ? `alias "${alias}" (collection "${collectionId}")` : `collection "${alias}"`;
    const availableKeysMsg = availableKeys?.length ? `. Available keys: ${availableKeys.join(`, `)}` : ``;
    super(`Input for ${details} not found in inputs map${availableKeysMsg}`);
  }
}
class DuplicateAliasInSubqueryError extends QueryCompilationError {
  constructor(alias, parentAliases) {
    super(
      `Subquery uses alias "${alias}" which is already used in the parent query. Each alias must be unique across parent and subquery contexts. Parent query aliases: ${parentAliases.join(`, `)}. Please rename "${alias}" in either the parent query or subquery to avoid conflicts.`
    );
  }
}
class UnsupportedFromTypeError extends QueryCompilationError {
  constructor(type) {
    super(`Unsupported FROM type: ${type}`);
  }
}
class UnknownExpressionTypeError extends QueryCompilationError {
  constructor(type) {
    super(`Unknown expression type: ${type}`);
  }
}
class EmptyReferencePathError extends QueryCompilationError {
  constructor() {
    super(`Reference path cannot be empty`);
  }
}
class UnknownFunctionError extends QueryCompilationError {
  constructor(functionName) {
    super(`Unknown function: ${functionName}`);
  }
}
class JoinCollectionNotFoundError extends QueryCompilationError {
  constructor(collectionId) {
    super(`Collection "${collectionId}" not found during compilation of join`);
  }
}
class JoinError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `JoinError`;
  }
}
class UnsupportedJoinTypeError extends JoinError {
  constructor(joinType) {
    super(`Unsupported join type: ${joinType}`);
  }
}
class InvalidJoinConditionSameSourceError extends JoinError {
  constructor(sourceAlias) {
    super(
      `Invalid join condition: both expressions refer to the same source "${sourceAlias}"`
    );
  }
}
class InvalidJoinConditionSourceMismatchError extends JoinError {
  constructor() {
    super(`Invalid join condition: expressions must reference source aliases`);
  }
}
class InvalidJoinConditionLeftSourceError extends JoinError {
  constructor(sourceAlias) {
    super(
      `Invalid join condition: left expression refers to an unavailable source "${sourceAlias}"`
    );
  }
}
class InvalidJoinConditionRightSourceError extends JoinError {
  constructor(sourceAlias) {
    super(
      `Invalid join condition: right expression does not refer to the joined source "${sourceAlias}"`
    );
  }
}
class InvalidJoinCondition extends JoinError {
  constructor() {
    super(`Invalid join condition`);
  }
}
class UnsupportedJoinSourceTypeError extends JoinError {
  constructor(type) {
    super(`Unsupported join source type: ${type}`);
  }
}
class GroupByError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `GroupByError`;
  }
}
class NonAggregateExpressionNotInGroupByError extends GroupByError {
  constructor(alias) {
    super(
      `Non-aggregate expression '${alias}' in SELECT must also appear in GROUP BY clause`
    );
  }
}
class UnsupportedAggregateFunctionError extends GroupByError {
  constructor(functionName) {
    super(`Unsupported aggregate function: ${functionName}`);
  }
}
class AggregateFunctionNotInSelectError extends GroupByError {
  constructor(functionName) {
    super(
      `Aggregate function in HAVING clause must also be in SELECT clause: ${functionName}`
    );
  }
}
class UnknownHavingExpressionTypeError extends GroupByError {
  constructor(type) {
    super(`Unknown expression type in HAVING clause: ${type}`);
  }
}
class StorageError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `StorageError`;
  }
}
class SerializationError extends StorageError {
  constructor(operation, originalError) {
    super(
      `Cannot ${operation} item because it cannot be JSON serialized: ${originalError}`
    );
  }
}
class LocalStorageCollectionError extends StorageError {
  constructor(message) {
    super(message);
    this.name = `LocalStorageCollectionError`;
  }
}
class StorageKeyRequiredError extends LocalStorageCollectionError {
  constructor() {
    super(`[LocalStorageCollection] storageKey must be provided.`);
  }
}
class InvalidStorageDataFormatError extends LocalStorageCollectionError {
  constructor(storageKey, key) {
    super(
      `[LocalStorageCollection] Invalid data format in storage key "${storageKey}" for key "${key}".`
    );
  }
}
class InvalidStorageObjectFormatError extends LocalStorageCollectionError {
  constructor(storageKey) {
    super(
      `[LocalStorageCollection] Invalid data format in storage key "${storageKey}". Expected object format.`
    );
  }
}
class SyncCleanupError extends TanStackDBError {
  constructor(collectionId, error) {
    const message = error instanceof Error ? error.message : String(error);
    super(
      `Collection "${collectionId}" sync cleanup function threw an error: ${message}`
    );
    this.name = `SyncCleanupError`;
  }
}
class QueryOptimizerError extends TanStackDBError {
  constructor(message) {
    super(message);
    this.name = `QueryOptimizerError`;
  }
}
class CannotCombineEmptyExpressionListError extends QueryOptimizerError {
  constructor() {
    super(`Cannot combine empty expression list`);
  }
}
class SubscriptionNotFoundError extends QueryCompilationError {
  constructor(resolvedAlias, originalAlias, collectionId, availableAliases) {
    super(
      `Internal error: subscription for alias '${resolvedAlias}' (remapped from '${originalAlias}', collection '${collectionId}') is missing in join pipeline. Available aliases: ${availableAliases.join(`, `)}. This indicates a bug in alias tracking.`
    );
  }
}
class MissingAliasInputsError extends QueryCompilationError {
  constructor(missingAliases) {
    super(
      `Internal error: compiler returned aliases without inputs: ${missingAliases.join(`, `)}. This indicates a bug in query compilation. Please report this issue.`
    );
  }
}
class SetWindowRequiresOrderByError extends QueryCompilationError {
  constructor() {
    super(
      `setWindow() can only be called on collections with an ORDER BY clause. Add .orderBy() to your query to enable window movement.`
    );
  }
}
const objectIds = /* @__PURE__ */ new WeakMap();
let nextObjectId = 1;
function getObjectId(obj) {
  if (objectIds.has(obj)) {
    return objectIds.get(obj);
  }
  const id = nextObjectId++;
  objectIds.set(obj, id);
  return id;
}
const ascComparator = (a, b, opts) => {
  const { nulls } = opts;
  if (a == null && b == null) return 0;
  if (a == null) return nulls === `first` ? -1 : 1;
  if (b == null) return nulls === `first` ? 1 : -1;
  if (typeof a === `string` && typeof b === `string`) {
    if (opts.stringSort === `locale`) {
      return a.localeCompare(b, opts.locale, opts.localeOptions);
    }
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const result = ascComparator(a[i], b[i], opts);
      if (result !== 0) {
        return result;
      }
    }
    return a.length - b.length;
  }
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }
  const aIsObject = typeof a === `object`;
  const bIsObject = typeof b === `object`;
  if (aIsObject || bIsObject) {
    if (aIsObject && bIsObject) {
      const aId = getObjectId(a);
      const bId = getObjectId(b);
      return aId - bId;
    }
    if (aIsObject) return 1;
    if (bIsObject) return -1;
  }
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};
const descComparator = (a, b, opts) => {
  return ascComparator(b, a, {
    ...opts,
    nulls: opts.nulls === `first` ? `last` : `first`
  });
};
function makeComparator(opts) {
  return (a, b) => {
    if (opts.direction === `asc`) {
      return ascComparator(a, b, opts);
    } else {
      return descComparator(a, b, opts);
    }
  };
}
const defaultComparator = makeComparator({
  direction: `asc`,
  nulls: `first`,
  stringSort: `locale`
});
function areUint8ArraysEqual(a, b) {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
const UINT8ARRAY_NORMALIZE_THRESHOLD = 128;
const UNDEFINED_SENTINEL = `__TS_DB_BTREE_UNDEFINED_VALUE__`;
function normalizeValue(value) {
  if (value instanceof Date) {
    return value.getTime();
  }
  const isUint8Array = typeof Buffer !== `undefined` && value instanceof Buffer || value instanceof Uint8Array;
  if (isUint8Array) {
    if (value.byteLength <= UINT8ARRAY_NORMALIZE_THRESHOLD) {
      return `__u8__${Array.from(value).join(`,`)}`;
    }
  }
  return value;
}
function normalizeForBTree(value) {
  if (value === void 0) {
    return UNDEFINED_SENTINEL;
  }
  return normalizeValue(value);
}
function denormalizeUndefined(value) {
  if (value === UNDEFINED_SENTINEL) {
    return void 0;
  }
  return value;
}
function areValuesEqual(a, b) {
  if (a === b) {
    return true;
  }
  const aIsUint8Array = typeof Buffer !== `undefined` && a instanceof Buffer || a instanceof Uint8Array;
  const bIsUint8Array = typeof Buffer !== `undefined` && b instanceof Buffer || b instanceof Uint8Array;
  if (aIsUint8Array && bIsUint8Array) {
    return areUint8ArraysEqual(a, b);
  }
  return false;
}
function isUnknown(value) {
  return value === null || value === void 0;
}
function toBooleanPredicate(result) {
  return result === true;
}
function compileExpression(expr, isSingleRow = false) {
  const compiledFn = compileExpressionInternal(expr, isSingleRow);
  return compiledFn;
}
function compileSingleRowExpression(expr) {
  const compiledFn = compileExpressionInternal(expr, true);
  return compiledFn;
}
function compileExpressionInternal(expr, isSingleRow) {
  switch (expr.type) {
    case `val`: {
      const value = expr.value;
      return () => value;
    }
    case `ref`: {
      return isSingleRow ? compileSingleRowRef(expr) : compileRef(expr);
    }
    case `func`: {
      return compileFunction(expr, isSingleRow);
    }
    default:
      throw new UnknownExpressionTypeError(expr.type);
  }
}
function compileRef(ref) {
  const [namespace, ...propertyPath] = ref.path;
  if (!namespace) {
    throw new EmptyReferencePathError();
  }
  if (namespace === `$selected`) {
    if (propertyPath.length === 0) {
      return (namespacedRow) => namespacedRow.$selected;
    } else if (propertyPath.length === 1) {
      const prop = propertyPath[0];
      return (namespacedRow) => {
        const selectResults = namespacedRow.$selected;
        return selectResults?.[prop];
      };
    } else {
      return (namespacedRow) => {
        const selectResults = namespacedRow.$selected;
        if (selectResults === void 0) {
          return void 0;
        }
        let value = selectResults;
        for (const prop of propertyPath) {
          if (value == null) {
            return value;
          }
          value = value[prop];
        }
        return value;
      };
    }
  }
  const tableAlias = namespace;
  if (propertyPath.length === 0) {
    return (namespacedRow) => namespacedRow[tableAlias];
  } else if (propertyPath.length === 1) {
    const prop = propertyPath[0];
    return (namespacedRow) => {
      const tableData = namespacedRow[tableAlias];
      return tableData?.[prop];
    };
  } else {
    return (namespacedRow) => {
      const tableData = namespacedRow[tableAlias];
      if (tableData === void 0) {
        return void 0;
      }
      let value = tableData;
      for (const prop of propertyPath) {
        if (value == null) {
          return value;
        }
        value = value[prop];
      }
      return value;
    };
  }
}
function compileSingleRowRef(ref) {
  const propertyPath = ref.path;
  return (item) => {
    let value = item;
    for (const prop of propertyPath) {
      if (value == null) {
        return value;
      }
      value = value[prop];
    }
    return value;
  };
}
function compileFunction(func, isSingleRow) {
  const compiledArgs = func.args.map(
    (arg) => compileExpressionInternal(arg, isSingleRow)
  );
  switch (func.name) {
    // Comparison operators
    case `eq`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = normalizeValue(argA(data));
        const b = normalizeValue(argB(data));
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        return areValuesEqual(a, b);
      };
    }
    case `gt`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        return a > b;
      };
    }
    case `gte`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        return a >= b;
      };
    }
    case `lt`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        return a < b;
      };
    }
    case `lte`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        if (isUnknown(a) || isUnknown(b)) {
          return null;
        }
        return a <= b;
      };
    }
    // Boolean operators
    case `and`:
      return (data) => {
        let hasUnknown = false;
        for (const compiledArg of compiledArgs) {
          const result = compiledArg(data);
          if (result === false) {
            return false;
          }
          if (isUnknown(result)) {
            hasUnknown = true;
          }
        }
        if (hasUnknown) {
          return null;
        }
        return true;
      };
    case `or`:
      return (data) => {
        let hasUnknown = false;
        for (const compiledArg of compiledArgs) {
          const result = compiledArg(data);
          if (result === true) {
            return true;
          }
          if (isUnknown(result)) {
            hasUnknown = true;
          }
        }
        if (hasUnknown) {
          return null;
        }
        return false;
      };
    case `not`: {
      const arg = compiledArgs[0];
      return (data) => {
        const result = arg(data);
        if (isUnknown(result)) {
          return null;
        }
        return !result;
      };
    }
    // Array operators
    case `in`: {
      const valueEvaluator = compiledArgs[0];
      const arrayEvaluator = compiledArgs[1];
      return (data) => {
        const value = normalizeValue(valueEvaluator(data));
        const array = arrayEvaluator(data);
        if (isUnknown(value)) {
          return null;
        }
        if (!Array.isArray(array)) {
          return false;
        }
        return array.some((item) => normalizeValue(item) === value);
      };
    }
    // String operators
    case `like`: {
      const valueEvaluator = compiledArgs[0];
      const patternEvaluator = compiledArgs[1];
      return (data) => {
        const value = valueEvaluator(data);
        const pattern = patternEvaluator(data);
        if (isUnknown(value) || isUnknown(pattern)) {
          return null;
        }
        return evaluateLike(value, pattern, false);
      };
    }
    case `ilike`: {
      const valueEvaluator = compiledArgs[0];
      const patternEvaluator = compiledArgs[1];
      return (data) => {
        const value = valueEvaluator(data);
        const pattern = patternEvaluator(data);
        if (isUnknown(value) || isUnknown(pattern)) {
          return null;
        }
        return evaluateLike(value, pattern, true);
      };
    }
    // String functions
    case `upper`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return typeof value === `string` ? value.toUpperCase() : value;
      };
    }
    case `lower`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return typeof value === `string` ? value.toLowerCase() : value;
      };
    }
    case `length`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        if (typeof value === `string`) {
          return value.length;
        }
        if (Array.isArray(value)) {
          return value.length;
        }
        return 0;
      };
    }
    case `concat`:
      return (data) => {
        return compiledArgs.map((evaluator) => {
          const arg = evaluator(data);
          try {
            return String(arg ?? ``);
          } catch {
            try {
              return JSON.stringify(arg) || ``;
            } catch {
              return `[object]`;
            }
          }
        }).join(``);
      };
    case `coalesce`:
      return (data) => {
        for (const evaluator of compiledArgs) {
          const value = evaluator(data);
          if (value !== null && value !== void 0) {
            return value;
          }
        }
        return null;
      };
    // Math functions
    case `add`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        return (a ?? 0) + (b ?? 0);
      };
    }
    case `subtract`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        return (a ?? 0) - (b ?? 0);
      };
    }
    case `multiply`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        return (a ?? 0) * (b ?? 0);
      };
    }
    case `divide`: {
      const argA = compiledArgs[0];
      const argB = compiledArgs[1];
      return (data) => {
        const a = argA(data);
        const b = argB(data);
        const divisor = b ?? 0;
        return divisor !== 0 ? (a ?? 0) / divisor : null;
      };
    }
    // Null/undefined checking functions
    case `isUndefined`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return value === void 0;
      };
    }
    case `isNull`: {
      const arg = compiledArgs[0];
      return (data) => {
        const value = arg(data);
        return value === null;
      };
    }
    default:
      throw new UnknownFunctionError(func.name);
  }
}
function evaluateLike(value, pattern, caseInsensitive) {
  if (typeof value !== `string` || typeof pattern !== `string`) {
    return false;
  }
  const searchValue = caseInsensitive ? value.toLowerCase() : value;
  const searchPattern = caseInsensitive ? pattern.toLowerCase() : pattern;
  let regexPattern = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  regexPattern = regexPattern.replace(/%/g, `.*`);
  regexPattern = regexPattern.replace(/_/g, `.`);
  const regex = new RegExp(`^${regexPattern}$`, "s");
  return regex.test(searchValue);
}
function deepEquals(a, b) {
  return deepEqualsInternal(a, b, /* @__PURE__ */ new Map());
}
function deepEqualsInternal(a, b, visited) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (a instanceof Date) {
    if (!(b instanceof Date)) return false;
    return a.getTime() === b.getTime();
  }
  if (b instanceof Date) return false;
  if (a instanceof RegExp) {
    if (!(b instanceof RegExp)) return false;
    return a.source === b.source && a.flags === b.flags;
  }
  if (b instanceof RegExp) return false;
  if (a instanceof Map) {
    if (!(b instanceof Map)) return false;
    if (a.size !== b.size) return false;
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const entries = Array.from(a.entries());
    const result = entries.every(([key, val]) => {
      return b.has(key) && deepEqualsInternal(val, b.get(key), visited);
    });
    visited.delete(a);
    return result;
  }
  if (b instanceof Map) return false;
  if (a instanceof Set) {
    if (!(b instanceof Set)) return false;
    if (a.size !== b.size) return false;
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const aValues = Array.from(a);
    const bValues = Array.from(b);
    if (aValues.every((val) => typeof val !== `object`)) {
      visited.delete(a);
      return aValues.every((val) => b.has(val));
    }
    const result = aValues.length === bValues.length;
    visited.delete(a);
    return result;
  }
  if (b instanceof Set) return false;
  if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b) && !(a instanceof DataView) && !(b instanceof DataView)) {
    const typedA = a;
    const typedB = b;
    if (typedA.length !== typedB.length) return false;
    for (let i = 0; i < typedA.length; i++) {
      if (typedA[i] !== typedB[i]) return false;
    }
    return true;
  }
  if (ArrayBuffer.isView(b) && !(b instanceof DataView) && !ArrayBuffer.isView(a)) {
    return false;
  }
  if (isTemporal(a) && isTemporal(b)) {
    const aTag = getStringTag(a);
    const bTag = getStringTag(b);
    if (aTag !== bTag) return false;
    if (typeof a.equals === `function`) {
      return a.equals(b);
    }
    return a.toString() === b.toString();
  }
  if (isTemporal(b)) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const result = a.every(
      (item, index) => deepEqualsInternal(item, b[index], visited)
    );
    visited.delete(a);
    return result;
  }
  if (Array.isArray(b)) return false;
  if (typeof a === `object`) {
    if (visited.has(a)) {
      return visited.get(a) === b;
    }
    visited.set(a, b);
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      visited.delete(a);
      return false;
    }
    const result = keysA.every(
      (key) => key in b && deepEqualsInternal(a[key], b[key], visited)
    );
    visited.delete(a);
    return result;
  }
  return false;
}
const temporalTypes = [
  `Temporal.Duration`,
  `Temporal.Instant`,
  `Temporal.PlainDate`,
  `Temporal.PlainDateTime`,
  `Temporal.PlainMonthDay`,
  `Temporal.PlainTime`,
  `Temporal.PlainYearMonth`,
  `Temporal.ZonedDateTime`
];
function getStringTag(a) {
  return a[Symbol.toStringTag];
}
function isTemporal(a) {
  const tag = getStringTag(a);
  return typeof tag === `string` && temporalTypes.includes(tag);
}
const DEFAULT_COMPARE_OPTIONS = {
  direction: `asc`,
  nulls: `first`,
  stringSort: `locale`
};
class ReverseIndex {
  constructor(index) {
    this.originalIndex = index;
  }
  // Define the reversed operations
  lookup(operation, value) {
    const reverseOperation = operation === `gt` ? `lt` : operation === `gte` ? `lte` : operation === `lt` ? `gt` : operation === `lte` ? `gte` : operation;
    return this.originalIndex.lookup(reverseOperation, value);
  }
  rangeQuery(options = {}) {
    return this.originalIndex.rangeQueryReversed(options);
  }
  rangeQueryReversed(options = {}) {
    return this.originalIndex.rangeQuery(options);
  }
  take(n, from, filterFn) {
    return this.originalIndex.takeReversed(n, from, filterFn);
  }
  takeFromStart(n, filterFn) {
    return this.originalIndex.takeReversedFromEnd(n, filterFn);
  }
  takeReversed(n, from, filterFn) {
    return this.originalIndex.take(n, from, filterFn);
  }
  takeReversedFromEnd(n, filterFn) {
    return this.originalIndex.takeFromStart(n, filterFn);
  }
  get orderedEntriesArray() {
    return this.originalIndex.orderedEntriesArrayReversed;
  }
  get orderedEntriesArrayReversed() {
    return this.originalIndex.orderedEntriesArray;
  }
  // All operations below delegate to the original index
  supports(operation) {
    return this.originalIndex.supports(operation);
  }
  matchesField(fieldPath) {
    return this.originalIndex.matchesField(fieldPath);
  }
  matchesCompareOptions(compareOptions) {
    return this.originalIndex.matchesCompareOptions(compareOptions);
  }
  matchesDirection(direction) {
    return this.originalIndex.matchesDirection(direction);
  }
  getStats() {
    return this.originalIndex.getStats();
  }
  add(key, item) {
    this.originalIndex.add(key, item);
  }
  remove(key, item) {
    this.originalIndex.remove(key, item);
  }
  update(key, oldItem, newItem) {
    this.originalIndex.update(key, oldItem, newItem);
  }
  build(entries) {
    this.originalIndex.build(entries);
  }
  clear() {
    this.originalIndex.clear();
  }
  get keyCount() {
    return this.originalIndex.keyCount;
  }
  equalityLookup(value) {
    return this.originalIndex.equalityLookup(value);
  }
  inArrayLookup(values) {
    return this.originalIndex.inArrayLookup(values);
  }
  get indexedKeysSet() {
    return this.originalIndex.indexedKeysSet;
  }
  get valueMapData() {
    return this.originalIndex.valueMapData;
  }
}
function findIndexForField(collection, fieldPath, compareOptions) {
  const compareOpts = compareOptions ?? {
    ...DEFAULT_COMPARE_OPTIONS,
    ...collection.compareOptions
  };
  for (const index of collection.indexes.values()) {
    if (index.matchesField(fieldPath) && index.matchesCompareOptions(compareOpts)) {
      if (!index.matchesDirection(compareOpts.direction)) {
        return new ReverseIndex(index);
      }
      return index;
    }
  }
  return void 0;
}
function intersectSets(sets) {
  if (sets.length === 0) return /* @__PURE__ */ new Set();
  if (sets.length === 1) return new Set(sets[0]);
  let result = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    const newResult = /* @__PURE__ */ new Set();
    for (const item of result) {
      if (sets[i].has(item)) {
        newResult.add(item);
      }
    }
    result = newResult;
  }
  return result;
}
function unionSets(sets) {
  const result = /* @__PURE__ */ new Set();
  for (const set of sets) {
    for (const item of set) {
      result.add(item);
    }
  }
  return result;
}
function optimizeExpressionWithIndexes(expression, collection) {
  return optimizeQueryRecursive(expression, collection);
}
function optimizeQueryRecursive(expression, collection) {
  if (expression.type === `func`) {
    switch (expression.name) {
      case `eq`:
      case `gt`:
      case `gte`:
      case `lt`:
      case `lte`:
        return optimizeSimpleComparison(expression, collection);
      case `and`:
        return optimizeAndExpression(expression, collection);
      case `or`:
        return optimizeOrExpression(expression, collection);
      case `in`:
        return optimizeInArrayExpression(expression, collection);
    }
  }
  return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
}
function optimizeCompoundRangeQuery(expression, collection) {
  if (expression.type !== `func` || expression.args.length < 2) {
    return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
  }
  const fieldOperations = /* @__PURE__ */ new Map();
  for (const arg of expression.args) {
    if (arg.type === `func` && [`gt`, `gte`, `lt`, `lte`].includes(arg.name)) {
      const rangeOp = arg;
      if (rangeOp.args.length === 2) {
        const leftArg = rangeOp.args[0];
        const rightArg = rangeOp.args[1];
        let fieldArg = null;
        let valueArg = null;
        let operation = rangeOp.name;
        if (leftArg.type === `ref` && rightArg.type === `val`) {
          fieldArg = leftArg;
          valueArg = rightArg;
        } else if (leftArg.type === `val` && rightArg.type === `ref`) {
          fieldArg = rightArg;
          valueArg = leftArg;
          switch (operation) {
            case `gt`:
              operation = `lt`;
              break;
            case `gte`:
              operation = `lte`;
              break;
            case `lt`:
              operation = `gt`;
              break;
            case `lte`:
              operation = `gte`;
              break;
          }
        }
        if (fieldArg && valueArg) {
          const fieldPath = fieldArg.path;
          const fieldKey = fieldPath.join(`.`);
          const value = valueArg.value;
          if (!fieldOperations.has(fieldKey)) {
            fieldOperations.set(fieldKey, []);
          }
          fieldOperations.get(fieldKey).push({ operation, value });
        }
      }
    }
  }
  for (const [fieldKey, operations] of fieldOperations) {
    if (operations.length >= 2) {
      const fieldPath = fieldKey.split(`.`);
      const index = findIndexForField(collection, fieldPath);
      if (index && index.supports(`gt`) && index.supports(`lt`)) {
        let from = void 0;
        let to = void 0;
        let fromInclusive = true;
        let toInclusive = true;
        for (const { operation, value } of operations) {
          switch (operation) {
            case `gt`:
              if (from === void 0 || value > from) {
                from = value;
                fromInclusive = false;
              }
              break;
            case `gte`:
              if (from === void 0 || value > from) {
                from = value;
                fromInclusive = true;
              }
              break;
            case `lt`:
              if (to === void 0 || value < to) {
                to = value;
                toInclusive = false;
              }
              break;
            case `lte`:
              if (to === void 0 || value < to) {
                to = value;
                toInclusive = true;
              }
              break;
          }
        }
        const matchingKeys = index.rangeQuery({
          from,
          to,
          fromInclusive,
          toInclusive
        });
        return { canOptimize: true, matchingKeys };
      }
    }
  }
  return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
}
function optimizeSimpleComparison(expression, collection) {
  if (expression.type !== `func` || expression.args.length !== 2) {
    return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
  }
  const leftArg = expression.args[0];
  const rightArg = expression.args[1];
  let fieldArg = null;
  let valueArg = null;
  let operation = expression.name;
  if (leftArg.type === `ref` && rightArg.type === `val`) {
    fieldArg = leftArg;
    valueArg = rightArg;
  } else if (leftArg.type === `val` && rightArg.type === `ref`) {
    fieldArg = rightArg;
    valueArg = leftArg;
    switch (operation) {
      case `gt`:
        operation = `lt`;
        break;
      case `gte`:
        operation = `lte`;
        break;
      case `lt`:
        operation = `gt`;
        break;
      case `lte`:
        operation = `gte`;
        break;
    }
  }
  if (fieldArg && valueArg) {
    const fieldPath = fieldArg.path;
    const index = findIndexForField(collection, fieldPath);
    if (index) {
      const queryValue = valueArg.value;
      const indexOperation = operation;
      if (!index.supports(indexOperation)) {
        return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
      }
      const matchingKeys = index.lookup(indexOperation, queryValue);
      return { canOptimize: true, matchingKeys };
    }
  }
  return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
}
function optimizeAndExpression(expression, collection) {
  if (expression.type !== `func` || expression.args.length < 2) {
    return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
  }
  const compoundRangeResult = optimizeCompoundRangeQuery(expression, collection);
  if (compoundRangeResult.canOptimize) {
    return compoundRangeResult;
  }
  const results = [];
  for (const arg of expression.args) {
    const result = optimizeQueryRecursive(arg, collection);
    if (result.canOptimize) {
      results.push(result);
    }
  }
  if (results.length > 0) {
    const allMatchingSets = results.map((r) => r.matchingKeys);
    const intersectedKeys = intersectSets(allMatchingSets);
    return { canOptimize: true, matchingKeys: intersectedKeys };
  }
  return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
}
function optimizeOrExpression(expression, collection) {
  if (expression.type !== `func` || expression.args.length < 2) {
    return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
  }
  const results = [];
  for (const arg of expression.args) {
    const result = optimizeQueryRecursive(arg, collection);
    if (result.canOptimize) {
      results.push(result);
    }
  }
  if (results.length > 0) {
    const allMatchingSets = results.map((r) => r.matchingKeys);
    const unionedKeys = unionSets(allMatchingSets);
    return { canOptimize: true, matchingKeys: unionedKeys };
  }
  return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
}
function optimizeInArrayExpression(expression, collection) {
  if (expression.type !== `func` || expression.args.length !== 2) {
    return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
  }
  const fieldArg = expression.args[0];
  const arrayArg = expression.args[1];
  if (fieldArg.type === `ref` && arrayArg.type === `val` && Array.isArray(arrayArg.value)) {
    const fieldPath = fieldArg.path;
    const values = arrayArg.value;
    const index = findIndexForField(collection, fieldPath);
    if (index) {
      if (index.supports(`in`)) {
        const matchingKeys = index.lookup(`in`, values);
        return { canOptimize: true, matchingKeys };
      } else if (index.supports(`eq`)) {
        const matchingKeys = /* @__PURE__ */ new Set();
        for (const value of values) {
          const keysForValue = index.lookup(`eq`, value);
          for (const key of keysForValue) {
            matchingKeys.add(key);
          }
        }
        return { canOptimize: true, matchingKeys };
      }
    }
  }
  return { canOptimize: false, matchingKeys: /* @__PURE__ */ new Set() };
}
class DefaultMap extends Map {
  constructor(defaultValue, entries) {
    super(entries);
    this.defaultValue = defaultValue;
  }
  get(key) {
    if (!this.has(key)) {
      return this.defaultValue();
    }
    return super.get(key);
  }
  /**
   * Update the value for a key using a function.
   */
  update(key, updater) {
    const value = this.get(key);
    const newValue = updater(value);
    this.set(key, newValue);
    return newValue;
  }
}
const chunkSize = 3e4;
function chunkedArrayPush(array, other) {
  if (other.length <= chunkSize) {
    array.push(...other);
  } else {
    for (let i = 0; i < other.length; i += chunkSize) {
      const chunk = other.slice(i, i + chunkSize);
      array.push(...chunk);
    }
  }
}
function binarySearch(array, value, comparator) {
  let low = 0;
  let high = array.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const comparison = comparator(array[mid], value);
    if (comparison < 0) {
      low = mid + 1;
    } else if (comparison > 0) {
      high = mid;
    } else {
      return mid;
    }
  }
  return low;
}
class ObjectIdGenerator {
  constructor() {
    this.objectIds = /* @__PURE__ */ new WeakMap();
    this.nextId = 0;
  }
  /**
   * Get a unique identifier for any value.
   * - Objects: Uses WeakMap for reference-based identity
   * - Primitives: Uses consistent string-based hashing
   */
  getId(value) {
    if (typeof value !== `object` || value === null) {
      const str = String(value);
      let hashValue = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hashValue = (hashValue << 5) - hashValue + char;
        hashValue = hashValue & hashValue;
      }
      return hashValue;
    }
    if (!this.objectIds.has(value)) {
      this.objectIds.set(value, this.nextId++);
    }
    return this.objectIds.get(value);
  }
  /**
   * Get a string representation of the ID for use in composite keys.
   */
  getStringId(value) {
    if (value === null) return `null`;
    if (value === void 0) return `undefined`;
    if (typeof value !== `object`) return `str_${String(value)}`;
    return `obj_${this.getId(value)}`;
  }
}
const globalObjectIdGenerator = new ObjectIdGenerator();
function diffHalfOpen(a, b) {
  const [a1, a2] = a;
  const [b1, b2] = b;
  const onlyInA = [
    ...range(a1, Math.min(a2, b1)),
    // left side of A outside B
    ...range(Math.max(a1, b2), a2)
    // right side of A outside B
  ];
  const onlyInB = [
    ...range(b1, Math.min(b2, a1)),
    ...range(Math.max(b1, a2), b2)
  ];
  return { onlyInA, onlyInB };
}
function range(start, end) {
  const out = [];
  for (let i = start; i < end; i++) out.push(i);
  return out;
}
function compareKeys(a, b) {
  if (typeof a === typeof b) {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }
  return typeof a === `string` ? -1 : 1;
}
function serializeValue(value) {
  return JSON.stringify(value, (_, val) => {
    if (typeof val === "bigint") {
      return val.toString();
    }
    if (val instanceof Date) {
      return val.toISOString();
    }
    return val;
  });
}
const RANDOM_SEED = randomHash();
const STRING_MARKER = randomHash();
const BIG_INT_MARKER = randomHash();
const NEG_BIG_INT_MARKER = randomHash();
const SYMBOL_MARKER = randomHash();
function randomHash() {
  return Math.random() * (2 ** 31 - 1) >>> 0;
}
const buf = new ArrayBuffer(8);
const dv$1 = new DataView(buf);
const u8 = new Uint8Array(buf);
class MurmurHashStream {
  constructor() {
    this.hash = RANDOM_SEED;
    this.length = 0;
    this.carry = 0;
    this.carryBytes = 0;
  }
  _mix(k1) {
    k1 = Math.imul(k1, 3432918353);
    k1 = k1 << 15 | k1 >>> 17;
    k1 = Math.imul(k1, 461845907);
    this.hash ^= k1;
    this.hash = this.hash << 13 | this.hash >>> 19;
    this.hash = Math.imul(this.hash, 5) + 3864292196;
  }
  writeByte(byte) {
    this.carry |= (byte & 255) << 8 * this.carryBytes;
    this.carryBytes++;
    this.length++;
    if (this.carryBytes === 4) {
      this._mix(this.carry >>> 0);
      this.carry = 0;
      this.carryBytes = 0;
    }
  }
  update(chunk) {
    switch (typeof chunk) {
      case `symbol`: {
        this.update(SYMBOL_MARKER);
        const description = chunk.description;
        if (!description) {
          return;
        }
        for (let i = 0; i < description.length; i++) {
          const code = description.charCodeAt(i);
          this.writeByte(code & 255);
          this.writeByte(code >>> 8 & 255);
        }
        return;
      }
      case `string`:
        this.update(STRING_MARKER);
        for (let i = 0; i < chunk.length; i++) {
          const code = chunk.charCodeAt(i);
          this.writeByte(code & 255);
          this.writeByte(code >>> 8 & 255);
        }
        return;
      case `number`:
        dv$1.setFloat64(0, chunk, true);
        this.writeByte(u8[0]);
        this.writeByte(u8[1]);
        this.writeByte(u8[2]);
        this.writeByte(u8[3]);
        this.writeByte(u8[4]);
        this.writeByte(u8[5]);
        this.writeByte(u8[6]);
        this.writeByte(u8[7]);
        return;
      case `bigint`: {
        let value = chunk;
        if (value < 0n) {
          value = -value;
          this.update(NEG_BIG_INT_MARKER);
        } else {
          this.update(BIG_INT_MARKER);
        }
        while (value > 0n) {
          this.writeByte(Number(value & 0xffn));
          value >>= 8n;
        }
        if (chunk === 0n) this.writeByte(0);
        return;
      }
      default:
        throw new TypeError(`Unsupported input type: ${typeof chunk}`);
    }
  }
  digest() {
    if (this.carryBytes > 0) {
      let k1 = this.carry >>> 0;
      k1 = Math.imul(k1, 3432918353);
      k1 = k1 << 15 | k1 >>> 17;
      k1 = Math.imul(k1, 461845907);
      this.hash ^= k1;
    }
    this.hash ^= this.length;
    this.hash ^= this.hash >>> 16;
    this.hash = Math.imul(this.hash, 2246822507);
    this.hash ^= this.hash >>> 13;
    this.hash = Math.imul(this.hash, 3266489909);
    this.hash ^= this.hash >>> 16;
    return this.hash >>> 0;
  }
}
const TRUE = randomHash();
const FALSE = randomHash();
const NULL = randomHash();
const UNDEFINED = randomHash();
const KEY = randomHash();
const FUNCTIONS = randomHash();
const DATE_MARKER = randomHash();
const OBJECT_MARKER = randomHash();
const ARRAY_MARKER = randomHash();
const MAP_MARKER = randomHash();
const SET_MARKER = randomHash();
const UINT8ARRAY_MARKER = randomHash();
const UINT8ARRAY_CONTENT_HASH_THRESHOLD = 128;
const hashCache = /* @__PURE__ */ new WeakMap();
function hash(input) {
  const hasher = new MurmurHashStream();
  updateHasher(hasher, input);
  return hasher.digest();
}
function hashObject(input) {
  const cachedHash = hashCache.get(input);
  if (cachedHash !== void 0) {
    return cachedHash;
  }
  let valueHash;
  if (input instanceof Date) {
    valueHash = hashDate(input);
  } else if (
    // Check if input is a Uint8Array or Buffer
    typeof Buffer !== `undefined` && input instanceof Buffer || input instanceof Uint8Array
  ) {
    if (input.byteLength <= UINT8ARRAY_CONTENT_HASH_THRESHOLD) {
      valueHash = hashUint8Array(input);
    } else {
      return cachedReferenceHash(input);
    }
  } else if (input instanceof File) {
    return cachedReferenceHash(input);
  } else {
    let plainObjectInput = input;
    let marker = OBJECT_MARKER;
    if (input instanceof Array) {
      marker = ARRAY_MARKER;
    }
    if (input instanceof Map) {
      marker = MAP_MARKER;
      plainObjectInput = [...input.entries()];
    }
    if (input instanceof Set) {
      marker = SET_MARKER;
      plainObjectInput = [...input.entries()];
    }
    valueHash = hashPlainObject(plainObjectInput, marker);
  }
  hashCache.set(input, valueHash);
  return valueHash;
}
function hashDate(input) {
  const hasher = new MurmurHashStream();
  hasher.update(DATE_MARKER);
  hasher.update(input.getTime());
  return hasher.digest();
}
function hashUint8Array(input) {
  const hasher = new MurmurHashStream();
  hasher.update(UINT8ARRAY_MARKER);
  hasher.update(input.byteLength);
  for (let i = 0; i < input.byteLength; i++) {
    hasher.writeByte(input[i]);
  }
  return hasher.digest();
}
function hashPlainObject(input, marker) {
  const hasher = new MurmurHashStream();
  hasher.update(marker);
  const keys = Object.keys(input);
  keys.sort(keySort);
  for (const key of keys) {
    hasher.update(KEY);
    hasher.update(key);
    updateHasher(hasher, input[key]);
  }
  return hasher.digest();
}
function updateHasher(hasher, input) {
  if (input === null) {
    hasher.update(NULL);
    return;
  }
  switch (typeof input) {
    case `undefined`:
      hasher.update(UNDEFINED);
      return;
    case `boolean`:
      hasher.update(input ? TRUE : FALSE);
      return;
    case `number`:
      hasher.update(isNaN(input) ? NaN : input === 0 ? 0 : input);
      return;
    case `bigint`:
    case `string`:
    case `symbol`:
      hasher.update(input);
      return;
    case `object`:
      hasher.update(getCachedHash(input));
      return;
    case `function`:
      hasher.update(cachedReferenceHash(input));
      return;
    default:
      console.warn(
        `Ignored input during hashing because it is of type ${typeof input} which is not supported`
      );
  }
}
function getCachedHash(input) {
  let valueHash = hashCache.get(input);
  if (valueHash === void 0) {
    valueHash = hashObject(input);
  }
  return valueHash;
}
let nextRefId = 1;
function cachedReferenceHash(fn) {
  let valueHash = hashCache.get(fn);
  if (valueHash === void 0) {
    valueHash = nextRefId ^ FUNCTIONS;
    nextRefId++;
    hashCache.set(fn, valueHash);
  }
  return valueHash;
}
function keySort(a, b) {
  return a.localeCompare(b);
}
class MultiSet {
  #inner;
  constructor(data = []) {
    this.#inner = data;
  }
  toString(indent = false) {
    return `MultiSet(${JSON.stringify(this.#inner, null, indent ? 2 : void 0)})`;
  }
  toJSON() {
    return JSON.stringify(Array.from(this.getInner()));
  }
  static fromJSON(json) {
    return new MultiSet(JSON.parse(json));
  }
  /**
   * Apply a function to all records in the collection.
   */
  map(f) {
    return new MultiSet(
      this.#inner.map(([data, multiplicity]) => [f(data), multiplicity])
    );
  }
  /**
   * Filter out records for which a function f(record) evaluates to False.
   */
  filter(f) {
    return new MultiSet(this.#inner.filter(([data, _]) => f(data)));
  }
  /**
   * Negate all multiplicities in the collection.
   */
  negate() {
    return new MultiSet(
      this.#inner.map(([data, multiplicity]) => [data, -multiplicity])
    );
  }
  /**
   * Concatenate two collections together.
   */
  concat(other) {
    const out = [];
    chunkedArrayPush(out, this.#inner);
    chunkedArrayPush(out, other.getInner());
    return new MultiSet(out);
  }
  /**
   * Produce as output a collection that is logically equivalent to the input
   * but which combines identical instances of the same record into one
   * (record, multiplicity) pair.
   */
  consolidate() {
    if (this.#inner.length > 0) {
      const firstItem = this.#inner[0]?.[0];
      if (Array.isArray(firstItem) && firstItem.length === 2) {
        return this.#consolidateKeyed();
      }
    }
    return this.#consolidateUnkeyed();
  }
  /**
   * Private method for consolidating keyed multisets where keys are strings/numbers
   * and values are compared by reference equality.
   *
   * This method provides significant performance improvements over the hash-based approach
   * by using WeakMap for object reference tracking and avoiding expensive serialization.
   *
   * Special handling for join operations: When values are tuples of length 2 (common in joins),
   * we unpack them and compare each element individually to maintain proper equality semantics.
   */
  #consolidateKeyed() {
    const consolidated = /* @__PURE__ */ new Map();
    const values = /* @__PURE__ */ new Map();
    const getTupleId = (tuple) => {
      if (tuple.length !== 2) {
        throw new Error(`Expected tuple of length 2`);
      }
      const [first, second] = tuple;
      return `${globalObjectIdGenerator.getStringId(first)}|${globalObjectIdGenerator.getStringId(second)}`;
    };
    for (const [data, multiplicity] of this.#inner) {
      if (!Array.isArray(data) || data.length !== 2) {
        return this.#consolidateUnkeyed();
      }
      const [key, value] = data;
      if (typeof key !== `string` && typeof key !== `number`) {
        return this.#consolidateUnkeyed();
      }
      let valueId;
      if (Array.isArray(value) && value.length === 2) {
        valueId = getTupleId(value);
      } else {
        valueId = globalObjectIdGenerator.getStringId(value);
      }
      const compositeKey = key + `|` + valueId;
      consolidated.set(
        compositeKey,
        (consolidated.get(compositeKey) || 0) + multiplicity
      );
      if (!values.has(compositeKey)) {
        values.set(compositeKey, data);
      }
    }
    const result = [];
    for (const [compositeKey, multiplicity] of consolidated) {
      if (multiplicity !== 0) {
        result.push([values.get(compositeKey), multiplicity]);
      }
    }
    return new MultiSet(result);
  }
  /**
   * Private method for consolidating unkeyed multisets using the original approach.
   */
  #consolidateUnkeyed() {
    const consolidated = new DefaultMap(() => 0);
    const values = /* @__PURE__ */ new Map();
    let hasString = false;
    let hasNumber = false;
    let hasOther = false;
    for (const [data, _] of this.#inner) {
      if (typeof data === `string`) {
        hasString = true;
      } else if (typeof data === `number`) {
        hasNumber = true;
      } else {
        hasOther = true;
        break;
      }
    }
    const requireJson = hasOther || hasString && hasNumber;
    for (const [data, multiplicity] of this.#inner) {
      const key = requireJson ? hash(data) : data;
      if (requireJson && !values.has(key)) {
        values.set(key, data);
      }
      consolidated.update(key, (count2) => count2 + multiplicity);
    }
    const result = [];
    for (const [key, multiplicity] of consolidated.entries()) {
      if (multiplicity !== 0) {
        const parsedKey = requireJson ? values.get(key) : key;
        result.push([parsedKey, multiplicity]);
      }
    }
    return new MultiSet(result);
  }
  extend(other) {
    const otherArray = other instanceof MultiSet ? other.getInner() : other;
    chunkedArrayPush(this.#inner, otherArray);
  }
  add(item, multiplicity) {
    if (multiplicity !== 0) {
      this.#inner.push([item, multiplicity]);
    }
  }
  getInner() {
    return this.#inner;
  }
}
class DifferenceStreamReader {
  #queue;
  constructor(queue) {
    this.#queue = queue;
  }
  drain() {
    const out = [...this.#queue].reverse();
    this.#queue.length = 0;
    return out;
  }
  isEmpty() {
    return this.#queue.length === 0;
  }
}
class DifferenceStreamWriter {
  #queues = [];
  sendData(collection) {
    if (!(collection instanceof MultiSet)) {
      collection = new MultiSet(collection);
    }
    for (const q of this.#queues) {
      q.unshift(collection);
    }
  }
  newReader() {
    const q = [];
    this.#queues.push(q);
    return new DifferenceStreamReader(q);
  }
}
class Operator {
  constructor(id, inputs, output2) {
    this.id = id;
    this.inputs = inputs;
    this.output = output2;
  }
  hasPendingWork() {
    return this.inputs.some((input) => !input.isEmpty());
  }
}
class UnaryOperator extends Operator {
  constructor(id, inputA, output2) {
    super(id, [inputA], output2);
    this.id = id;
  }
  inputMessages() {
    return this.inputs[0].drain();
  }
}
class BinaryOperator extends Operator {
  constructor(id, inputA, inputB, output2) {
    super(id, [inputA, inputB], output2);
    this.id = id;
  }
  inputAMessages() {
    return this.inputs[0].drain();
  }
  inputBMessages() {
    return this.inputs[1].drain();
  }
}
class LinearUnaryOperator extends UnaryOperator {
  run() {
    for (const message of this.inputMessages()) {
      this.output.sendData(this.inner(message));
    }
  }
}
class D2 {
  #operators = [];
  #nextOperatorId = 0;
  #finalized = false;
  constructor() {
  }
  #checkNotFinalized() {
    if (this.#finalized) {
      throw new Error(`Graph already finalized`);
    }
  }
  getNextOperatorId() {
    this.#checkNotFinalized();
    return this.#nextOperatorId++;
  }
  newInput() {
    this.#checkNotFinalized();
    const writer = new DifferenceStreamWriter();
    const streamBuilder = new RootStreamBuilder(this, writer);
    return streamBuilder;
  }
  addOperator(operator) {
    this.#checkNotFinalized();
    this.#operators.push(operator);
  }
  finalize() {
    this.#checkNotFinalized();
    this.#finalized = true;
  }
  step() {
    if (!this.#finalized) {
      throw new Error(`Graph not finalized`);
    }
    for (const op of this.#operators) {
      op.run();
    }
  }
  pendingWork() {
    return this.#operators.some((op) => op.hasPendingWork());
  }
  run() {
    while (this.pendingWork()) {
      this.step();
    }
  }
}
class StreamBuilder {
  #graph;
  #writer;
  constructor(graph, writer) {
    this.#graph = graph;
    this.#writer = writer;
  }
  connectReader() {
    return this.#writer.newReader();
  }
  get writer() {
    return this.#writer;
  }
  get graph() {
    return this.#graph;
  }
  pipe(...operators) {
    return operators.reduce((stream, operator) => {
      return operator(stream);
    }, this);
  }
}
class RootStreamBuilder extends StreamBuilder {
  sendData(collection) {
    this.writer.sendData(collection);
  }
}
class MapOperator extends LinearUnaryOperator {
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  inner(collection) {
    return collection.map(this.#f);
  }
}
function map(f) {
  return (stream) => {
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new MapOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      output2.writer,
      f
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
const NO_PREFIX = /* @__PURE__ */ Symbol(`NO_PREFIX`);
class PrefixMap extends Map {
  /**
   * Add a value to the PrefixMap. Returns true if the map becomes empty after the operation.
   */
  addValue(value, multiplicity) {
    if (multiplicity === 0) return this.size === 0;
    const prefix = getPrefix(value);
    const valueMapOrSingleValue = this.get(prefix);
    if (isSingleValue(valueMapOrSingleValue)) {
      const [currentValue, currentMultiplicity] = valueMapOrSingleValue;
      const currentPrefix = getPrefix(currentValue);
      if (currentPrefix !== prefix) {
        throw new Error(`Mismatching prefixes, this should never happen`);
      }
      if (currentValue === value || hash(currentValue) === hash(value)) {
        const newMultiplicity = currentMultiplicity + multiplicity;
        if (newMultiplicity === 0) {
          this.delete(prefix);
        } else {
          this.set(prefix, [value, newMultiplicity]);
        }
      } else {
        const valueMap = new ValueMap();
        valueMap.set(hash(currentValue), valueMapOrSingleValue);
        valueMap.set(hash(value), [value, multiplicity]);
        this.set(prefix, valueMap);
      }
    } else if (valueMapOrSingleValue === void 0) {
      this.set(prefix, [value, multiplicity]);
    } else {
      const isEmpty = valueMapOrSingleValue.addValue(value, multiplicity);
      if (isEmpty) {
        this.delete(prefix);
      }
    }
    return this.size === 0;
  }
}
class ValueMap extends Map {
  /**
   * Add a value to the ValueMap. Returns true if the map becomes empty after the operation.
   * @param value - The full value to store
   * @param multiplicity - The multiplicity to add
   * @param hashKey - Optional hash key to use instead of hashing the full value (used when in PrefixMap context)
   */
  addValue(value, multiplicity) {
    if (multiplicity === 0) return this.size === 0;
    const key = hash(value);
    const currentValue = this.get(key);
    if (currentValue) {
      const [, currentMultiplicity] = currentValue;
      const newMultiplicity = currentMultiplicity + multiplicity;
      if (newMultiplicity === 0) {
        this.delete(key);
      } else {
        this.set(key, [value, newMultiplicity]);
      }
    } else {
      this.set(key, [value, multiplicity]);
    }
    return this.size === 0;
  }
}
class Index {
  /*
   * This index maintains a nested map of keys -> (value, multiplicities), where:
   * - initially the values are stored against the key as a single value tuple
   * - when a key gets additional values, the values are stored against the key in a
   *   prefix map
   * - the prefix is extract where possible from values that are structured as
   *   [rowPrimaryKey, rowValue], as they are in the Tanstack DB query pipeline.
   * - only when there are multiple values for a given prefix do we fall back to a
   *   hash to identify identical values, storing them in a third level value map.
   */
  #inner;
  #consolidatedMultiplicity = /* @__PURE__ */ new Map();
  // sum of multiplicities per key
  constructor() {
    this.#inner = /* @__PURE__ */ new Map();
  }
  /**
   * Create an Index from multiple MultiSet messages.
   * @param messages - Array of MultiSet messages to build the index from.
   * @returns A new Index containing all the data from the messages.
   */
  static fromMultiSets(messages) {
    const index = new Index();
    for (const message of messages) {
      for (const [item, multiplicity] of message.getInner()) {
        const [key, value] = item;
        index.addValue(key, [value, multiplicity]);
      }
    }
    return index;
  }
  /**
   * This method returns a string representation of the index.
   * @param indent - Whether to indent the string representation.
   * @returns A string representation of the index.
   */
  toString(indent = false) {
    return `Index(${JSON.stringify(
      [...this.entries()],
      void 0,
      indent ? 2 : void 0
    )})`;
  }
  /**
   * The size of the index.
   */
  get size() {
    return this.#inner.size;
  }
  /**
   * This method checks if the index has a given key.
   * @param key - The key to check.
   * @returns True if the index has the key, false otherwise.
   */
  has(key) {
    return this.#inner.has(key);
  }
  /**
   * Check if a key has presence (non-zero consolidated multiplicity).
   * @param key - The key to check.
   * @returns True if the key has non-zero consolidated multiplicity, false otherwise.
   */
  hasPresence(key) {
    return (this.#consolidatedMultiplicity.get(key) || 0) !== 0;
  }
  /**
   * Get the consolidated multiplicity (sum of multiplicities) for a key.
   * @param key - The key to get the consolidated multiplicity for.
   * @returns The consolidated multiplicity for the key.
   */
  getConsolidatedMultiplicity(key) {
    return this.#consolidatedMultiplicity.get(key) || 0;
  }
  /**
   * Get all keys that have presence (non-zero consolidated multiplicity).
   * @returns An iterator of keys with non-zero consolidated multiplicity.
   */
  getPresenceKeys() {
    return this.#consolidatedMultiplicity.keys();
  }
  /**
   * This method returns all values for a given key.
   * @param key - The key to get the values for.
   * @returns An array of value tuples [value, multiplicity].
   */
  get(key) {
    return [...this.getIterator(key)];
  }
  /**
   * This method returns an iterator over all values for a given key.
   * @param key - The key to get the values for.
   * @returns An iterator of value tuples [value, multiplicity].
   */
  *getIterator(key) {
    const mapOrSingleValue = this.#inner.get(key);
    if (isSingleValue(mapOrSingleValue)) {
      yield mapOrSingleValue;
    } else if (mapOrSingleValue === void 0) {
      return;
    } else if (mapOrSingleValue instanceof ValueMap) {
      for (const valueTuple of mapOrSingleValue.values()) {
        yield valueTuple;
      }
    } else {
      for (const singleValueOrValueMap of mapOrSingleValue.values()) {
        if (isSingleValue(singleValueOrValueMap)) {
          yield singleValueOrValueMap;
        } else {
          for (const valueTuple of singleValueOrValueMap.values()) {
            yield valueTuple;
          }
        }
      }
    }
  }
  /**
   * This returns an iterator that iterates over all key-value pairs.
   * @returns An iterable of all key-value pairs (and their multiplicities) in the index.
   */
  *entries() {
    for (const key of this.#inner.keys()) {
      for (const valueTuple of this.getIterator(key)) {
        yield [key, valueTuple];
      }
    }
  }
  /**
   * This method only iterates over the keys and not over the values.
   * Hence, it is more efficient than the `#entries` method.
   * It returns an iterator that you can use if you need to iterate over the values for a given key.
   * @returns An iterator of all *keys* in the index and their corresponding value iterator.
   */
  *entriesIterators() {
    for (const key of this.#inner.keys()) {
      yield [key, this.getIterator(key)];
    }
  }
  /**
   * This method adds a value to the index.
   * @param key - The key to add the value to.
   * @param valueTuple - The value tuple [value, multiplicity] to add to the index.
   */
  addValue(key, valueTuple) {
    const [value, multiplicity] = valueTuple;
    if (multiplicity === 0) return;
    const newConsolidatedMultiplicity = (this.#consolidatedMultiplicity.get(key) || 0) + multiplicity;
    if (newConsolidatedMultiplicity === 0) {
      this.#consolidatedMultiplicity.delete(key);
    } else {
      this.#consolidatedMultiplicity.set(key, newConsolidatedMultiplicity);
    }
    const mapOrSingleValue = this.#inner.get(key);
    if (mapOrSingleValue === void 0) {
      this.#inner.set(key, valueTuple);
      return;
    }
    if (isSingleValue(mapOrSingleValue)) {
      this.#handleSingleValueTransition(
        key,
        mapOrSingleValue,
        value,
        multiplicity
      );
      return;
    }
    if (mapOrSingleValue instanceof ValueMap) {
      const prefix = getPrefix(value);
      if (prefix !== NO_PREFIX) {
        const prefixMap = new PrefixMap();
        prefixMap.set(NO_PREFIX, mapOrSingleValue);
        prefixMap.set(prefix, valueTuple);
        this.#inner.set(key, prefixMap);
      } else {
        const isEmpty = mapOrSingleValue.addValue(value, multiplicity);
        if (isEmpty) {
          this.#inner.delete(key);
        }
      }
    } else {
      const isEmpty = mapOrSingleValue.addValue(value, multiplicity);
      if (isEmpty) {
        this.#inner.delete(key);
      }
    }
  }
  /**
   * Handle the transition from a single value to either a ValueMap or PrefixMap
   */
  #handleSingleValueTransition(key, currentSingleValue, newValue, multiplicity) {
    const [currentValue, currentMultiplicity] = currentSingleValue;
    if (currentValue === newValue) {
      const newMultiplicity = currentMultiplicity + multiplicity;
      if (newMultiplicity === 0) {
        this.#inner.delete(key);
      } else {
        this.#inner.set(key, [newValue, newMultiplicity]);
      }
      return;
    }
    const newPrefix = getPrefix(newValue);
    const currentPrefix = getPrefix(currentValue);
    if (currentPrefix === newPrefix && (currentValue === newValue || hash(currentValue) === hash(newValue))) {
      const newMultiplicity = currentMultiplicity + multiplicity;
      if (newMultiplicity === 0) {
        this.#inner.delete(key);
      } else {
        this.#inner.set(key, [newValue, newMultiplicity]);
      }
      return;
    }
    if (currentPrefix === NO_PREFIX && newPrefix === NO_PREFIX) {
      const valueMap = new ValueMap();
      valueMap.set(hash(currentValue), currentSingleValue);
      valueMap.set(hash(newValue), [newValue, multiplicity]);
      this.#inner.set(key, valueMap);
    } else {
      const prefixMap = new PrefixMap();
      if (currentPrefix === newPrefix) {
        const valueMap = new ValueMap();
        valueMap.set(hash(currentValue), currentSingleValue);
        valueMap.set(hash(newValue), [newValue, multiplicity]);
        prefixMap.set(currentPrefix, valueMap);
      } else {
        prefixMap.set(currentPrefix, currentSingleValue);
        prefixMap.set(newPrefix, [newValue, multiplicity]);
      }
      this.#inner.set(key, prefixMap);
    }
  }
  /**
   * This method appends another index to the current index.
   * @param other - The index to append to the current index.
   */
  append(other) {
    for (const [key, value] of other.entries()) {
      this.addValue(key, value);
    }
  }
  /**
   * This method joins two indexes.
   * @param other - The index to join with the current index.
   * @returns A multiset of the joined values.
   */
  join(other) {
    const result = [];
    if (this.size <= other.size) {
      for (const [key, valueIt] of this.entriesIterators()) {
        if (!other.has(key)) continue;
        const otherValues = other.get(key);
        for (const [val1, mul1] of valueIt) {
          for (const [val2, mul2] of otherValues) {
            if (mul1 !== 0 && mul2 !== 0) {
              result.push([[key, [val1, val2]], mul1 * mul2]);
            }
          }
        }
      }
    } else {
      for (const [key, otherValueIt] of other.entriesIterators()) {
        if (!this.has(key)) continue;
        const values = this.get(key);
        for (const [val2, mul2] of otherValueIt) {
          for (const [val1, mul1] of values) {
            if (mul1 !== 0 && mul2 !== 0) {
              result.push([[key, [val1, val2]], mul1 * mul2]);
            }
          }
        }
      }
    }
    return new MultiSet(result);
  }
}
function getPrefix(value) {
  if (Array.isArray(value) && (typeof value[0] === `string` || typeof value[0] === `number` || typeof value[0] === `bigint`)) {
    return value[0];
  }
  return NO_PREFIX;
}
function isSingleValue(value) {
  return Array.isArray(value);
}
class ReduceOperator extends UnaryOperator {
  #index = new Index();
  #indexOut = new Index();
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  run() {
    const keysTodo = /* @__PURE__ */ new Set();
    for (const message of this.inputMessages()) {
      for (const [item, multiplicity] of message.getInner()) {
        const [key, value] = item;
        this.#index.addValue(key, [value, multiplicity]);
        keysTodo.add(key);
      }
    }
    const result = [];
    for (const key of keysTodo) {
      const curr = this.#index.get(key);
      const currOut = this.#indexOut.get(key);
      const out = this.#f(curr);
      const newOutputMap = /* @__PURE__ */ new Map();
      const oldOutputMap = /* @__PURE__ */ new Map();
      for (const [value, multiplicity] of out) {
        const existing = newOutputMap.get(value) ?? 0;
        newOutputMap.set(value, existing + multiplicity);
      }
      for (const [value, multiplicity] of currOut) {
        const existing = oldOutputMap.get(value) ?? 0;
        oldOutputMap.set(value, existing + multiplicity);
      }
      for (const [value, multiplicity] of oldOutputMap) {
        if (!newOutputMap.has(value)) {
          result.push([[key, value], -multiplicity]);
          this.#indexOut.addValue(key, [value, -multiplicity]);
        }
      }
      for (const [value, multiplicity] of newOutputMap) {
        if (!oldOutputMap.has(value)) {
          if (multiplicity !== 0) {
            result.push([[key, value], multiplicity]);
            this.#indexOut.addValue(key, [value, multiplicity]);
          }
        }
      }
      for (const [value, newMultiplicity] of newOutputMap) {
        const oldMultiplicity = oldOutputMap.get(value);
        if (oldMultiplicity !== void 0) {
          const delta = newMultiplicity - oldMultiplicity;
          if (delta !== 0) {
            result.push([[key, value], delta]);
            this.#indexOut.addValue(key, [value, delta]);
          }
        }
      }
    }
    if (result.length > 0) {
      this.output.sendData(new MultiSet(result));
    }
  }
}
function reduce(f) {
  return (stream) => {
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new ReduceOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      output2.writer,
      f
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
function isPipedAggregateFunction(aggregate) {
  return `pipe` in aggregate;
}
function groupBy(keyExtractor, aggregates = {}) {
  const basicAggregates = Object.fromEntries(
    Object.entries(aggregates).filter(
      ([_, aggregate]) => !isPipedAggregateFunction(aggregate)
    )
  );
  Object.fromEntries(
    Object.entries(aggregates).filter(
      ([_, aggregate]) => isPipedAggregateFunction(aggregate)
    )
  );
  return (stream) => {
    const KEY_SENTINEL = `__original_key__`;
    const withKeysAndValues = stream.pipe(
      map((data) => {
        const key = keyExtractor(data);
        const keyString = serializeValue(key);
        const values = {};
        values[KEY_SENTINEL] = key;
        for (const [name, aggregate] of Object.entries(basicAggregates)) {
          values[name] = aggregate.preMap(data);
        }
        return [keyString, values];
      })
    );
    const reduced = withKeysAndValues.pipe(
      reduce((values) => {
        let totalMultiplicity = 0;
        for (const [_, multiplicity] of values) {
          totalMultiplicity += multiplicity;
        }
        if (totalMultiplicity <= 0) {
          return [];
        }
        const result = {};
        const originalKey = values[0]?.[0]?.[KEY_SENTINEL];
        result[KEY_SENTINEL] = originalKey;
        for (const [name, aggregate] of Object.entries(basicAggregates)) {
          const preValues = values.map(
            ([v, m]) => [v[name], m]
          );
          result[name] = aggregate.reduce(preValues);
        }
        return [[result, 1]];
      })
    );
    return reduced.pipe(
      map(([keyString, values]) => {
        const key = values[KEY_SENTINEL];
        const result = {};
        Object.assign(result, key);
        for (const [name, aggregate] of Object.entries(basicAggregates)) {
          if (aggregate.postMap) {
            result[name] = aggregate.postMap(values[name]);
          } else {
            result[name] = values[name];
          }
        }
        return [keyString, result];
      })
    );
  };
}
function sum$1(valueExtractor = (v) => v) {
  return {
    preMap: (data) => valueExtractor(data),
    reduce: (values) => {
      let total = 0;
      for (const [value, multiplicity] of values) {
        total += value * multiplicity;
      }
      return total;
    }
  };
}
function count$2(valueExtractor = (v) => v) {
  return {
    // Count only not-null values (the `== null` comparison gives true for both null and undefined)
    preMap: (data) => valueExtractor(data) == null ? 0 : 1,
    reduce: (values) => {
      let totalCount = 0;
      for (const [nullMultiplier, multiplicity] of values) {
        totalCount += nullMultiplier * multiplicity;
      }
      return totalCount;
    }
  };
}
function avg$1(valueExtractor = (v) => v) {
  return {
    preMap: (data) => ({
      sum: valueExtractor(data),
      count: 0
    }),
    reduce: (values) => {
      let totalSum = 0;
      let totalCount = 0;
      for (const [value, multiplicity] of values) {
        totalSum += value.sum * multiplicity;
        totalCount += multiplicity;
      }
      return {
        sum: totalSum,
        count: totalCount
      };
    },
    postMap: (result) => {
      return result.sum / result.count;
    }
  };
}
function min$1(valueExtractor) {
  const extractor = valueExtractor ?? ((v) => v);
  return {
    preMap: (data) => extractor(data),
    reduce: (values) => {
      let minValue;
      for (const [value, _multiplicity] of values) {
        if (!minValue || value && value < minValue) {
          minValue = value;
        }
      }
      return minValue;
    }
  };
}
function max$1(valueExtractor) {
  const extractor = valueExtractor ?? ((v) => v);
  return {
    preMap: (data) => extractor(data),
    reduce: (values) => {
      let maxValue;
      for (const [value, _multiplicity] of values) {
        if (!maxValue || value && value > maxValue) {
          maxValue = value;
        }
      }
      return maxValue;
    }
  };
}
const groupByOperators = {
  sum: sum$1,
  count: count$2,
  avg: avg$1,
  min: min$1,
  max: max$1
};
class TapOperator extends LinearUnaryOperator {
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  inner(collection) {
    this.#f(collection);
    return collection;
  }
}
function tap(f) {
  return (stream) => {
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new TapOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      output2.writer,
      f
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
class FilterOperator extends LinearUnaryOperator {
  #f;
  constructor(id, inputA, output2, f) {
    super(id, inputA, output2);
    this.#f = f;
  }
  inner(collection) {
    return collection.filter(this.#f);
  }
}
function filter(f) {
  return (stream) => {
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new FilterOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      output2.writer,
      f
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
class OutputOperator extends UnaryOperator {
  #fn;
  constructor(id, inputA, outputWriter, fn) {
    super(id, inputA, outputWriter);
    this.#fn = fn;
  }
  run() {
    for (const message of this.inputMessages()) {
      this.#fn(message);
      this.output.sendData(message);
    }
  }
}
function output(fn) {
  return (stream) => {
    const outputStream = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new OutputOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      outputStream.writer,
      fn
    );
    stream.graph.addOperator(operator);
    return outputStream;
  };
}
class ConsolidateOperator extends UnaryOperator {
  run() {
    const messages = this.inputMessages();
    if (messages.length === 0) {
      return;
    }
    const combined = new MultiSet();
    for (const message of messages) {
      combined.extend(message);
    }
    const consolidated = combined.consolidate();
    if (consolidated.getInner().length > 0) {
      this.output.sendData(consolidated);
    }
  }
}
function consolidate() {
  return (stream) => {
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new ConsolidateOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      output2.writer
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
class JoinOperator extends BinaryOperator {
  #indexA = new Index();
  #indexB = new Index();
  #mode;
  constructor(id, inputA, inputB, output2, mode = `inner`) {
    super(id, inputA, inputB, output2);
    this.#mode = mode;
  }
  run() {
    const deltaA = Index.fromMultiSets(
      this.inputAMessages()
    );
    const deltaB = Index.fromMultiSets(
      this.inputBMessages()
    );
    if (deltaA.size === 0 && deltaB.size === 0) return;
    const results = new MultiSet();
    if (this.#mode !== `anti`) {
      this.emitInnerResults(deltaA, deltaB, results);
    }
    if (this.#mode === `left` || this.#mode === `full` || this.#mode === `anti`) {
      this.emitLeftOuterResults(deltaA, deltaB, results);
    }
    if (this.#mode === `right` || this.#mode === `full`) {
      this.emitRightOuterResults(deltaA, deltaB, results);
    }
    this.#indexA.append(deltaA);
    this.#indexB.append(deltaB);
    if (results.getInner().length > 0) {
      this.output.sendData(results);
    }
  }
  emitInnerResults(deltaA, deltaB, results) {
    if (deltaA.size > 0) results.extend(deltaA.join(this.#indexB));
    if (deltaB.size > 0) results.extend(this.#indexA.join(deltaB));
    if (deltaA.size > 0 && deltaB.size > 0) results.extend(deltaA.join(deltaB));
  }
  emitLeftOuterResults(deltaA, deltaB, results) {
    if (deltaA.size > 0) {
      for (const [key, valueIterator] of deltaA.entriesIterators()) {
        const currentMultiplicityB = this.#indexB.getConsolidatedMultiplicity(key);
        const deltaMultiplicityB = deltaB.getConsolidatedMultiplicity(key);
        const finalMultiplicityB = currentMultiplicityB + deltaMultiplicityB;
        if (finalMultiplicityB === 0) {
          for (const [value, multiplicity] of valueIterator) {
            if (multiplicity !== 0) {
              results.add([key, [value, null]], multiplicity);
            }
          }
        }
      }
    }
    if (deltaB.size > 0) {
      for (const key of deltaB.getPresenceKeys()) {
        const before = this.#indexB.getConsolidatedMultiplicity(key);
        const deltaMult = deltaB.getConsolidatedMultiplicity(key);
        if (deltaMult === 0) continue;
        const after = before + deltaMult;
        if (before === 0 === (after === 0)) continue;
        const transitioningToMatched = before === 0;
        for (const [value, multiplicity] of this.#indexA.getIterator(key)) {
          if (multiplicity !== 0) {
            results.add(
              [key, [value, null]],
              transitioningToMatched ? -multiplicity : +multiplicity
            );
          }
        }
      }
    }
  }
  emitRightOuterResults(deltaA, deltaB, results) {
    if (deltaB.size > 0) {
      for (const [key, valueIterator] of deltaB.entriesIterators()) {
        const currentMultiplicityA = this.#indexA.getConsolidatedMultiplicity(key);
        const deltaMultiplicityA = deltaA.getConsolidatedMultiplicity(key);
        const finalMultiplicityA = currentMultiplicityA + deltaMultiplicityA;
        if (finalMultiplicityA === 0) {
          for (const [value, multiplicity] of valueIterator) {
            if (multiplicity !== 0) {
              results.add([key, [null, value]], multiplicity);
            }
          }
        }
      }
    }
    if (deltaA.size > 0) {
      for (const key of deltaA.getPresenceKeys()) {
        const before = this.#indexA.getConsolidatedMultiplicity(key);
        const deltaMult = deltaA.getConsolidatedMultiplicity(key);
        if (deltaMult === 0) continue;
        const after = before + deltaMult;
        if (before === 0 === (after === 0)) continue;
        const transitioningToMatched = before === 0;
        for (const [value, multiplicity] of this.#indexB.getIterator(key)) {
          if (multiplicity !== 0) {
            results.add(
              [key, [null, value]],
              transitioningToMatched ? -multiplicity : +multiplicity
            );
          }
        }
      }
    }
  }
}
function join(other, type = `inner`) {
  return (stream) => {
    if (stream.graph !== other.graph) {
      throw new Error(`Cannot join streams from different graphs`);
    }
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new JoinOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      other.connectReader(),
      output2.writer,
      type
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
class DistinctOperator extends UnaryOperator {
  #by;
  #values;
  // keeps track of the number of times each value has been seen
  constructor(id, input, output2, by = (value) => value) {
    super(id, input, output2);
    this.#by = by;
    this.#values = /* @__PURE__ */ new Map();
  }
  run() {
    const updatedValues = /* @__PURE__ */ new Map();
    for (const message of this.inputMessages()) {
      for (const [value, diff] of message.getInner()) {
        const hashedValue = hash(this.#by(value));
        const oldMultiplicity = updatedValues.get(hashedValue)?.[0] ?? this.#values.get(hashedValue) ?? 0;
        const newMultiplicity = oldMultiplicity + diff;
        updatedValues.set(hashedValue, [newMultiplicity, value]);
      }
    }
    const result = [];
    for (const [
      hashedValue,
      [newMultiplicity, value]
    ] of updatedValues.entries()) {
      const oldMultiplicity = this.#values.get(hashedValue) ?? 0;
      if (newMultiplicity === 0) {
        this.#values.delete(hashedValue);
      } else {
        this.#values.set(hashedValue, newMultiplicity);
      }
      if (oldMultiplicity <= 0 && newMultiplicity > 0) {
        result.push([[hash(this.#by(value)), value[1]], 1]);
      } else if (oldMultiplicity > 0 && newMultiplicity <= 0) {
        result.push([[hash(this.#by(value)), value[1]], -1]);
      }
    }
    if (result.length > 0) {
      this.output.sendData(new MultiSet(result));
    }
  }
}
function distinct(by = (value) => value) {
  return (stream) => {
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new DistinctOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      output2.writer,
      by
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
const BASE_62_DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function midpoint(a, b, digits) {
  const zero = digits[0];
  if (b != null && a >= b) {
    throw new Error(a + " >= " + b);
  }
  if (a.slice(-1) === zero || b && b.slice(-1) === zero) {
    throw new Error("trailing zero");
  }
  if (b) {
    let n = 0;
    while ((a[n] || zero) === b[n]) {
      n++;
    }
    if (n > 0) {
      return b.slice(0, n) + midpoint(a.slice(n), b.slice(n), digits);
    }
  }
  const digitA = a ? digits.indexOf(a[0]) : 0;
  const digitB = b != null ? digits.indexOf(b[0]) : digits.length;
  if (digitB - digitA > 1) {
    const midDigit = Math.round(0.5 * (digitA + digitB));
    return digits[midDigit];
  } else {
    if (b && b.length > 1) {
      return b.slice(0, 1);
    } else {
      return digits[digitA] + midpoint(a.slice(1), null, digits);
    }
  }
}
function validateInteger(int) {
  if (int.length !== getIntegerLength(int[0])) {
    throw new Error("invalid integer part of order key: " + int);
  }
}
function getIntegerLength(head) {
  if (head >= "a" && head <= "z") {
    return head.charCodeAt(0) - "a".charCodeAt(0) + 2;
  } else if (head >= "A" && head <= "Z") {
    return "Z".charCodeAt(0) - head.charCodeAt(0) + 2;
  } else {
    throw new Error("invalid order key head: " + head);
  }
}
function getIntegerPart(key) {
  const integerPartLength = getIntegerLength(key[0]);
  if (integerPartLength > key.length) {
    throw new Error("invalid order key: " + key);
  }
  return key.slice(0, integerPartLength);
}
function validateOrderKey(key, digits) {
  if (key === "A" + digits[0].repeat(26)) {
    throw new Error("invalid order key: " + key);
  }
  const i = getIntegerPart(key);
  const f = key.slice(i.length);
  if (f.slice(-1) === digits[0]) {
    throw new Error("invalid order key: " + key);
  }
}
function incrementInteger(x, digits) {
  validateInteger(x);
  const [head, ...digs] = x.split("");
  let carry = true;
  for (let i = digs.length - 1; carry && i >= 0; i--) {
    const d = digits.indexOf(digs[i]) + 1;
    if (d === digits.length) {
      digs[i] = digits[0];
    } else {
      digs[i] = digits[d];
      carry = false;
    }
  }
  if (carry) {
    if (head === "Z") {
      return "a" + digits[0];
    }
    if (head === "z") {
      return null;
    }
    const h = String.fromCharCode(head.charCodeAt(0) + 1);
    if (h > "a") {
      digs.push(digits[0]);
    } else {
      digs.pop();
    }
    return h + digs.join("");
  } else {
    return head + digs.join("");
  }
}
function decrementInteger(x, digits) {
  validateInteger(x);
  const [head, ...digs] = x.split("");
  let borrow = true;
  for (let i = digs.length - 1; borrow && i >= 0; i--) {
    const d = digits.indexOf(digs[i]) - 1;
    if (d === -1) {
      digs[i] = digits.slice(-1);
    } else {
      digs[i] = digits[d];
      borrow = false;
    }
  }
  if (borrow) {
    if (head === "a") {
      return "Z" + digits.slice(-1);
    }
    if (head === "A") {
      return null;
    }
    const h = String.fromCharCode(head.charCodeAt(0) - 1);
    if (h < "Z") {
      digs.push(digits.slice(-1));
    } else {
      digs.pop();
    }
    return h + digs.join("");
  } else {
    return head + digs.join("");
  }
}
function generateKeyBetween(a, b, digits = BASE_62_DIGITS) {
  if (a != null) {
    validateOrderKey(a, digits);
  }
  if (b != null) {
    validateOrderKey(b, digits);
  }
  if (a != null && b != null && a >= b) {
    throw new Error(a + " >= " + b);
  }
  if (a == null) {
    if (b == null) {
      return "a" + digits[0];
    }
    const ib2 = getIntegerPart(b);
    const fb2 = b.slice(ib2.length);
    if (ib2 === "A" + digits[0].repeat(26)) {
      return ib2 + midpoint("", fb2, digits);
    }
    if (ib2 < b) {
      return ib2;
    }
    const res = decrementInteger(ib2, digits);
    if (res == null) {
      throw new Error("cannot decrement any more");
    }
    return res;
  }
  if (b == null) {
    const ia2 = getIntegerPart(a);
    const fa2 = a.slice(ia2.length);
    const i2 = incrementInteger(ia2, digits);
    return i2 == null ? ia2 + midpoint(fa2, null, digits) : i2;
  }
  const ia = getIntegerPart(a);
  const fa = a.slice(ia.length);
  const ib = getIntegerPart(b);
  const fb = b.slice(ib.length);
  if (ia === ib) {
    return ia + midpoint(fa, fb, digits);
  }
  const i = incrementInteger(ia, digits);
  if (i == null) {
    throw new Error("cannot increment any more");
  }
  if (i < b) {
    return i;
  }
  return ia + midpoint(fa, null, digits);
}
function indexedValue(value, index) {
  return [value, index];
}
function getValue(indexedVal) {
  return indexedVal[0];
}
function getIndex(indexedVal) {
  return indexedVal[1];
}
function createKeyedComparator(comparator) {
  return ([aKey, aVal], [bKey, bVal]) => {
    const valueComparison = comparator(aVal, bVal);
    if (valueComparison !== 0) {
      return valueComparison;
    }
    return compareKeys(aKey, bKey);
  };
}
class TopKArray {
  #sortedValues = [];
  #comparator;
  #topKStart;
  #topKEnd;
  constructor(offset, limit, comparator) {
    this.#topKStart = offset;
    this.#topKEnd = offset + limit;
    this.#comparator = comparator;
  }
  get size() {
    const offset = this.#topKStart;
    const limit = this.#topKEnd - this.#topKStart;
    const available = this.#sortedValues.length - offset;
    return Math.max(0, Math.min(limit, available));
  }
  /**
   * Moves the topK window
   */
  move({
    offset,
    limit
  }) {
    const oldOffset = this.#topKStart;
    const oldLimit = this.#topKEnd - this.#topKStart;
    const oldRange = [
      this.#topKStart,
      this.#topKEnd === Infinity ? this.#topKStart + this.size : this.#topKEnd
    ];
    this.#topKStart = offset ?? oldOffset;
    this.#topKEnd = this.#topKStart + (limit ?? oldLimit);
    const newRange = [
      this.#topKStart,
      this.#topKEnd === Infinity ? Math.max(this.#topKStart + this.size, oldRange[1]) : this.#topKEnd
    ];
    const { onlyInA, onlyInB } = diffHalfOpen(oldRange, newRange);
    const moveIns = [];
    onlyInB.forEach((index) => {
      const value = this.#sortedValues[index];
      if (value) {
        moveIns.push(value);
      }
    });
    const moveOuts = [];
    onlyInA.forEach((index) => {
      const value = this.#sortedValues[index];
      if (value) {
        moveOuts.push(value);
      }
    });
    return { moveIns, moveOuts, changes: onlyInA.length + onlyInB.length > 0 };
  }
  insert(value) {
    const result = { moveIn: null, moveOut: null };
    const index = this.#findIndex(value);
    const indexBefore = index === 0 ? null : getIndex(this.#sortedValues[index - 1]);
    const indexAfter = index === this.#sortedValues.length ? null : getIndex(this.#sortedValues[index]);
    const fractionalIndex = generateKeyBetween(indexBefore, indexAfter);
    const val = indexedValue(value, fractionalIndex);
    this.#sortedValues.splice(index, 0, val);
    if (index < this.#topKEnd) {
      const moveInIndex = Math.max(index, this.#topKStart);
      if (moveInIndex < this.#sortedValues.length) {
        result.moveIn = this.#sortedValues[moveInIndex];
        if (this.#topKEnd < this.#sortedValues.length) {
          result.moveOut = this.#sortedValues[this.#topKEnd];
        }
      }
    }
    return result;
  }
  /**
   * Deletes a value that may or may not be in the topK.
   * IMPORTANT: this assumes that the value is present in the collection
   *            if it's not the case it will remove the element
   *            that is on the position where the provided `value` would be.
   */
  delete(value) {
    const result = { moveIn: null, moveOut: null };
    const index = this.#findIndex(value);
    const [removedElem] = this.#sortedValues.splice(index, 1);
    if (index < this.#topKEnd) {
      result.moveOut = removedElem;
      if (index < this.#topKStart) {
        const moveOutIndex = this.#topKStart - 1;
        if (moveOutIndex < this.#sortedValues.length) {
          result.moveOut = this.#sortedValues[moveOutIndex];
        } else {
          result.moveOut = null;
        }
      }
      const moveInIndex = this.#topKEnd - 1;
      if (moveInIndex < this.#sortedValues.length) {
        result.moveIn = this.#sortedValues[moveInIndex];
      }
    }
    return result;
  }
  // TODO: see if there is a way to refactor the code for insert and delete in the topK above
  //       because they are very similar, one is shifting the topK window to the left and the other is shifting it to the right
  //       so i have the feeling there is a common pattern here and we can implement both cases using that pattern
  #findIndex(value) {
    return binarySearch(
      this.#sortedValues,
      indexedValue(value, ``),
      (a, b) => this.#comparator(getValue(a), getValue(b))
    );
  }
}
class TopKState {
  #multiplicities = /* @__PURE__ */ new Map();
  #topK;
  constructor(topK) {
    this.#topK = topK;
  }
  get size() {
    return this.#topK.size;
  }
  get isEmpty() {
    return this.#multiplicities.size === 0 && this.#topK.size === 0;
  }
  /**
   * Process an element update (insert or delete based on multiplicity change).
   * Returns the changes to the topK window.
   */
  processElement(key, value, multiplicity) {
    const { oldMultiplicity, newMultiplicity } = this.#updateMultiplicity(
      key,
      multiplicity
    );
    if (oldMultiplicity <= 0 && newMultiplicity > 0) {
      return this.#topK.insert([key, value]);
    } else if (oldMultiplicity > 0 && newMultiplicity <= 0) {
      return this.#topK.delete([key, value]);
    }
    return { moveIn: null, moveOut: null };
  }
  /**
   * Move the topK window. Only works with TopKArray implementation.
   */
  move(options) {
    if (!(this.#topK instanceof TopKArray)) {
      throw new Error(
        `Cannot move B+-tree implementation of TopK with fractional index`
      );
    }
    return this.#topK.move(options);
  }
  #updateMultiplicity(key, multiplicity) {
    if (multiplicity === 0) {
      const current = this.#multiplicities.get(key) ?? 0;
      return { oldMultiplicity: current, newMultiplicity: current };
    }
    const oldMultiplicity = this.#multiplicities.get(key) ?? 0;
    const newMultiplicity = oldMultiplicity + multiplicity;
    if (newMultiplicity === 0) {
      this.#multiplicities.delete(key);
    } else {
      this.#multiplicities.set(key, newMultiplicity);
    }
    return { oldMultiplicity, newMultiplicity };
  }
}
function handleMoveIn(moveIn, result) {
  if (moveIn) {
    const [[key, value], index] = moveIn;
    result.push([[key, [value, index]], 1]);
  }
}
function handleMoveOut(moveOut, result) {
  if (moveOut) {
    const [[key, value], index] = moveOut;
    result.push([[key, [value, index]], -1]);
  }
}
class TopKWithFractionalIndexOperator extends UnaryOperator {
  #state;
  constructor(id, inputA, output2, comparator, options) {
    super(id, inputA, output2);
    const limit = options.limit ?? Infinity;
    const offset = options.offset ?? 0;
    const topK = this.createTopK(
      offset,
      limit,
      createKeyedComparator(comparator)
    );
    this.#state = new TopKState(topK);
    options.setSizeCallback?.(() => this.#state.size);
    options.setWindowFn?.(this.moveTopK.bind(this));
  }
  createTopK(offset, limit, comparator) {
    return new TopKArray(offset, limit, comparator);
  }
  /**
   * Moves the topK window based on the provided offset and limit.
   * Any changes to the topK are sent to the output.
   */
  moveTopK({ offset, limit }) {
    const result = [];
    const diff = this.#state.move({ offset, limit });
    diff.moveIns.forEach((moveIn) => handleMoveIn(moveIn, result));
    diff.moveOuts.forEach((moveOut) => handleMoveOut(moveOut, result));
    if (diff.changes) {
      this.output.sendData(new MultiSet(result));
    }
  }
  run() {
    const result = [];
    for (const message of this.inputMessages()) {
      for (const [item, multiplicity] of message.getInner()) {
        const [key, value] = item;
        this.processElement(key, value, multiplicity, result);
      }
    }
    if (result.length > 0) {
      this.output.sendData(new MultiSet(result));
    }
  }
  processElement(key, value, multiplicity, result) {
    const changes = this.#state.processElement(key, value, multiplicity);
    handleMoveIn(changes.moveIn, result);
    handleMoveOut(changes.moveOut, result);
  }
}
function topKWithFractionalIndex(comparator, options) {
  const opts = options || {};
  return (stream) => {
    const output2 = new StreamBuilder(
      stream.graph,
      new DifferenceStreamWriter()
    );
    const operator = new TopKWithFractionalIndexOperator(
      stream.graph.getNextOperatorId(),
      stream.connectReader(),
      output2.writer,
      comparator,
      opts
    );
    stream.graph.addOperator(operator);
    return output2;
  };
}
function orderByWithFractionalIndexBase(topKFunction, valueExtractor, options) {
  const limit = options?.limit ?? Infinity;
  const offset = options?.offset ?? 0;
  const setSizeCallback = options?.setSizeCallback;
  const setWindowFn = options?.setWindowFn;
  const comparator = options?.comparator ?? ((a, b) => {
    if (a === b) return 0;
    if (a < b) return -1;
    return 1;
  });
  return (stream) => {
    return stream.pipe(
      topKFunction(
        (a, b) => comparator(valueExtractor(a), valueExtractor(b)),
        {
          limit,
          offset,
          setSizeCallback,
          setWindowFn
        }
      ),
      consolidate()
    );
  };
}
function orderByWithFractionalIndex(valueExtractor, options) {
  return orderByWithFractionalIndexBase(
    topKWithFractionalIndex,
    valueExtractor,
    options
  );
}
class BTree {
  /**
   * Initializes an empty B+ tree.
   * @param compare Custom function to compare pairs of elements in the tree.
   *   If not specified, defaultComparator will be used which is valid as long as K extends DefaultComparable.
   * @param entries A set of key-value pairs to initialize the tree
   * @param maxNodeSize Branching factor (maximum items or children per node)
   *   Must be in range 4..256. If undefined or <4 then default is used; if >256 then 256.
   */
  constructor(compare, entries, maxNodeSize) {
    this._root = EmptyLeaf;
    this._size = 0;
    this._maxNodeSize = maxNodeSize >= 4 ? Math.min(maxNodeSize, 256) : 32;
    this._compare = compare;
    if (entries) this.setPairs(entries);
  }
  // ///////////////////////////////////////////////////////////////////////////
  // ES6 Map<K,V> methods /////////////////////////////////////////////////////
  /** Gets the number of key-value pairs in the tree. */
  get size() {
    return this._size;
  }
  /** Gets the number of key-value pairs in the tree. */
  get length() {
    return this._size;
  }
  /** Returns true iff the tree contains no key-value pairs. */
  get isEmpty() {
    return this._size === 0;
  }
  /** Releases the tree so that its size is 0. */
  clear() {
    this._root = EmptyLeaf;
    this._size = 0;
  }
  /**
   * Finds a pair in the tree and returns the associated value.
   * @param defaultValue a value to return if the key was not found.
   * @returns the value, or defaultValue if the key was not found.
   * @description Computational complexity: O(log size)
   */
  get(key, defaultValue) {
    return this._root.get(key, defaultValue, this);
  }
  /**
   * Adds or overwrites a key-value pair in the B+ tree.
   * @param key the key is used to determine the sort order of
   *        data in the tree.
   * @param value data to associate with the key (optional)
   * @param overwrite Whether to overwrite an existing key-value pair
   *        (default: true). If this is false and there is an existing
   *        key-value pair then this method has no effect.
   * @returns true if a new key-value pair was added.
   * @description Computational complexity: O(log size)
   * Note: when overwriting a previous entry, the key is updated
   * as well as the value. This has no effect unless the new key
   * has data that does not affect its sort order.
   */
  set(key, value, overwrite) {
    if (this._root.isShared) this._root = this._root.clone();
    const result = this._root.set(key, value, overwrite, this);
    if (result === true || result === false) return result;
    this._root = new BNodeInternal([this._root, result]);
    return true;
  }
  /**
   * Returns true if the key exists in the B+ tree, false if not.
   * Use get() for best performance; use has() if you need to
   * distinguish between "undefined value" and "key not present".
   * @param key Key to detect
   * @description Computational complexity: O(log size)
   */
  has(key) {
    return this.forRange(key, key, true, void 0) !== 0;
  }
  /**
   * Removes a single key-value pair from the B+ tree.
   * @param key Key to find
   * @returns true if a pair was found and removed, false otherwise.
   * @description Computational complexity: O(log size)
   */
  delete(key) {
    return this.editRange(key, key, true, DeleteRange) !== 0;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Additional methods ///////////////////////////////////////////////////////
  /** Returns the maximum number of children/values before nodes will split. */
  get maxNodeSize() {
    return this._maxNodeSize;
  }
  /** Gets the lowest key in the tree. Complexity: O(log size) */
  minKey() {
    return this._root.minKey();
  }
  /** Gets the highest key in the tree. Complexity: O(1) */
  maxKey() {
    return this._root.maxKey();
  }
  /** Gets an array of all keys, sorted */
  keysArray() {
    const results = [];
    this._root.forRange(
      this.minKey(),
      this.maxKey(),
      true,
      false,
      this,
      0,
      (k, _v) => {
        results.push(k);
      }
    );
    return results;
  }
  /** Returns the next pair whose key is larger than the specified key (or undefined if there is none).
   * If key === undefined, this function returns the lowest pair.
   * @param key The key to search for.
   * @param reusedArray Optional array used repeatedly to store key-value pairs, to
   * avoid creating a new array on every iteration.
   */
  nextHigherPair(key, reusedArray) {
    reusedArray = reusedArray || [];
    if (key === void 0) {
      return this._root.minPair(reusedArray);
    }
    return this._root.getPairOrNextHigher(
      key,
      this._compare,
      false,
      reusedArray
    );
  }
  /** Returns the next key larger than the specified key, or undefined if there is none.
   *  Also, nextHigherKey(undefined) returns the lowest key.
   */
  nextHigherKey(key) {
    const p = this.nextHigherPair(key, ReusedArray);
    return p && p[0];
  }
  /** Returns the next pair whose key is smaller than the specified key (or undefined if there is none).
   *  If key === undefined, this function returns the highest pair.
   * @param key The key to search for.
   * @param reusedArray Optional array used repeatedly to store key-value pairs, to
   *        avoid creating a new array each time you call this method.
   */
  nextLowerPair(key, reusedArray) {
    reusedArray = reusedArray || [];
    if (key === void 0) {
      return this._root.maxPair(reusedArray);
    }
    return this._root.getPairOrNextLower(key, this._compare, false, reusedArray);
  }
  /** Returns the next key smaller than the specified key, or undefined if there is none.
   *  Also, nextLowerKey(undefined) returns the highest key.
   */
  nextLowerKey(key) {
    const p = this.nextLowerPair(key, ReusedArray);
    return p && p[0];
  }
  /** Adds all pairs from a list of key-value pairs.
   * @param pairs Pairs to add to this tree. If there are duplicate keys,
   *        later pairs currently overwrite earlier ones (e.g. [[0,1],[0,7]]
   *        associates 0 with 7.)
   * @param overwrite Whether to overwrite pairs that already exist (if false,
   *        pairs[i] is ignored when the key pairs[i][0] already exists.)
   * @returns The number of pairs added to the collection.
   * @description Computational complexity: O(pairs.length * log(size + pairs.length))
   */
  setPairs(pairs, overwrite) {
    let added = 0;
    for (const pair of pairs) {
      if (this.set(pair[0], pair[1], overwrite)) added++;
    }
    return added;
  }
  /**
   * Scans the specified range of keys, in ascending order by key.
   * Note: the callback `onFound` must not insert or remove items in the
   * collection. Doing so may cause incorrect data to be sent to the
   * callback afterward.
   * @param low The first key scanned will be greater than or equal to `low`.
   * @param high Scanning stops when a key larger than this is reached.
   * @param includeHigh If the `high` key is present, `onFound` is called for
   *        that final pair if and only if this parameter is true.
   * @param onFound A function that is called for each key-value pair. This
   *        function can return {break:R} to stop early with result R.
   * @param initialCounter Initial third argument of onFound. This value
   *        increases by one each time `onFound` is called. Default: 0
   * @returns The number of values found, or R if the callback returned
   *        `{break:R}` to stop early.
   * @description Computational complexity: O(number of items scanned + log size)
   */
  forRange(low, high, includeHigh, onFound, initialCounter) {
    const r = this._root.forRange(
      low,
      high,
      includeHigh,
      false,
      this,
      initialCounter || 0,
      onFound
    );
    return typeof r === `number` ? r : r.break;
  }
  /**
   * Scans and potentially modifies values for a subsequence of keys.
   * Note: the callback `onFound` should ideally be a pure function.
   *   Specfically, it must not insert items, call clone(), or change
   *   the collection except via return value; out-of-band editing may
   *   cause an exception or may cause incorrect data to be sent to
   *   the callback (duplicate or missed items). It must not cause a
   *   clone() of the collection, otherwise the clone could be modified
   *   by changes requested by the callback.
   * @param low The first key scanned will be greater than or equal to `low`.
   * @param high Scanning stops when a key larger than this is reached.
   * @param includeHigh If the `high` key is present, `onFound` is called for
   *        that final pair if and only if this parameter is true.
   * @param onFound A function that is called for each key-value pair. This
   *        function can return `{value:v}` to change the value associated
   *        with the current key, `{delete:true}` to delete the current pair,
   *        `{break:R}` to stop early with result R, or it can return nothing
   *        (undefined or {}) to cause no effect and continue iterating.
   *        `{break:R}` can be combined with one of the other two commands.
   *        The third argument `counter` is the number of items iterated
   *        previously; it equals 0 when `onFound` is called the first time.
   * @returns The number of values scanned, or R if the callback returned
   *        `{break:R}` to stop early.
   * @description
   *   Computational complexity: O(number of items scanned + log size)
   *   Note: if the tree has been cloned with clone(), any shared
   *   nodes are copied before `onFound` is called. This takes O(n) time
   *   where n is proportional to the amount of shared data scanned.
   */
  editRange(low, high, includeHigh, onFound, initialCounter) {
    let root = this._root;
    if (root.isShared) this._root = root = root.clone();
    try {
      const r = root.forRange(
        low,
        high,
        includeHigh,
        true,
        this,
        initialCounter || 0,
        onFound
      );
      return typeof r === `number` ? r : r.break;
    } finally {
      let isShared;
      while (root.keys.length <= 1 && !root.isLeaf) {
        isShared ||= root.isShared;
        this._root = root = root.keys.length === 0 ? EmptyLeaf : root.children[0];
      }
      if (isShared) {
        root.isShared = true;
      }
    }
  }
}
class BNode {
  get isLeaf() {
    return this.children === void 0;
  }
  constructor(keys = [], values) {
    this.keys = keys;
    this.values = values || undefVals;
    this.isShared = void 0;
  }
  // /////////////////////////////////////////////////////////////////////////
  // Shared methods /////////////////////////////////////////////////////////
  maxKey() {
    return this.keys[this.keys.length - 1];
  }
  // If key not found, returns i^failXor where i is the insertion index.
  // Callers that don't care whether there was a match will set failXor=0.
  indexOf(key, failXor, cmp) {
    const keys = this.keys;
    let lo = 0, hi = keys.length, mid = hi >> 1;
    while (lo < hi) {
      const c = cmp(keys[mid], key);
      if (c < 0) lo = mid + 1;
      else if (c > 0)
        hi = mid;
      else if (c === 0) return mid;
      else {
        if (key === key)
          return keys.length;
        else throw new Error(`BTree: NaN was used as a key`);
      }
      mid = lo + hi >> 1;
    }
    return mid ^ failXor;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Leaf Node: misc //////////////////////////////////////////////////////////
  minKey() {
    return this.keys[0];
  }
  minPair(reusedArray) {
    if (this.keys.length === 0) return void 0;
    reusedArray[0] = this.keys[0];
    reusedArray[1] = this.values[0];
    return reusedArray;
  }
  maxPair(reusedArray) {
    if (this.keys.length === 0) return void 0;
    const lastIndex = this.keys.length - 1;
    reusedArray[0] = this.keys[lastIndex];
    reusedArray[1] = this.values[lastIndex];
    return reusedArray;
  }
  clone() {
    const v = this.values;
    return new BNode(this.keys.slice(0), v === undefVals ? v : v.slice(0));
  }
  get(key, defaultValue, tree) {
    const i = this.indexOf(key, -1, tree._compare);
    return i < 0 ? defaultValue : this.values[i];
  }
  getPairOrNextLower(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, -1, compare);
    const indexOrLower = i < 0 ? ~i - 1 : inclusive ? i : i - 1;
    if (indexOrLower >= 0) {
      reusedArray[0] = this.keys[indexOrLower];
      reusedArray[1] = this.values[indexOrLower];
      return reusedArray;
    }
    return void 0;
  }
  getPairOrNextHigher(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, -1, compare);
    const indexOrLower = i < 0 ? ~i : inclusive ? i : i + 1;
    const keys = this.keys;
    if (indexOrLower < keys.length) {
      reusedArray[0] = keys[indexOrLower];
      reusedArray[1] = this.values[indexOrLower];
      return reusedArray;
    }
    return void 0;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Leaf Node: set & node splitting //////////////////////////////////////////
  set(key, value, overwrite, tree) {
    let i = this.indexOf(key, -1, tree._compare);
    if (i < 0) {
      i = ~i;
      tree._size++;
      if (this.keys.length < tree._maxNodeSize) {
        return this.insertInLeaf(i, key, value, tree);
      } else {
        const newRightSibling = this.splitOffRightSide();
        let target = this;
        if (i > this.keys.length) {
          i -= this.keys.length;
          target = newRightSibling;
        }
        target.insertInLeaf(i, key, value, tree);
        return newRightSibling;
      }
    } else {
      if (overwrite !== false) {
        if (value !== void 0) this.reifyValues();
        this.keys[i] = key;
        this.values[i] = value;
      }
      return false;
    }
  }
  reifyValues() {
    if (this.values === undefVals)
      return this.values = this.values.slice(0, this.keys.length);
    return this.values;
  }
  insertInLeaf(i, key, value, tree) {
    this.keys.splice(i, 0, key);
    if (this.values === undefVals) {
      while (undefVals.length < tree._maxNodeSize) undefVals.push(void 0);
      if (value === void 0) {
        return true;
      } else {
        this.values = undefVals.slice(0, this.keys.length - 1);
      }
    }
    this.values.splice(i, 0, value);
    return true;
  }
  takeFromRight(rhs) {
    let v = this.values;
    if (rhs.values === undefVals) {
      if (v !== undefVals) v.push(void 0);
    } else {
      v = this.reifyValues();
      v.push(rhs.values.shift());
    }
    this.keys.push(rhs.keys.shift());
  }
  takeFromLeft(lhs) {
    let v = this.values;
    if (lhs.values === undefVals) {
      if (v !== undefVals) v.unshift(void 0);
    } else {
      v = this.reifyValues();
      v.unshift(lhs.values.pop());
    }
    this.keys.unshift(lhs.keys.pop());
  }
  splitOffRightSide() {
    const half = this.keys.length >> 1, keys = this.keys.splice(half);
    const values = this.values === undefVals ? undefVals : this.values.splice(half);
    return new BNode(keys, values);
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Leaf Node: scanning & deletions //////////////////////////////////////////
  forRange(low, high, includeHigh, editMode, tree, count2, onFound) {
    const cmp = tree._compare;
    let iLow, iHigh;
    if (high === low) {
      if (!includeHigh) return count2;
      iHigh = (iLow = this.indexOf(low, -1, cmp)) + 1;
      if (iLow < 0) return count2;
    } else {
      iLow = this.indexOf(low, 0, cmp);
      iHigh = this.indexOf(high, -1, cmp);
      if (iHigh < 0) iHigh = ~iHigh;
      else if (includeHigh === true) iHigh++;
    }
    const keys = this.keys, values = this.values;
    if (onFound !== void 0) {
      for (let i = iLow; i < iHigh; i++) {
        const key = keys[i];
        const result = onFound(key, values[i], count2++);
        if (result !== void 0) {
          if (editMode === true) {
            if (key !== keys[i] || this.isShared === true)
              throw new Error(`BTree illegally changed or cloned in editRange`);
            if (result.delete) {
              this.keys.splice(i, 1);
              if (this.values !== undefVals) this.values.splice(i, 1);
              tree._size--;
              i--;
              iHigh--;
            } else if (result.hasOwnProperty(`value`)) {
              values[i] = result.value;
            }
          }
          if (result.break !== void 0) return result;
        }
      }
    } else count2 += iHigh - iLow;
    return count2;
  }
  /** Adds entire contents of right-hand sibling (rhs is left unchanged) */
  mergeSibling(rhs, _) {
    this.keys.push.apply(this.keys, rhs.keys);
    if (this.values === undefVals) {
      if (rhs.values === undefVals) return;
      this.values = this.values.slice(0, this.keys.length);
    }
    this.values.push.apply(this.values, rhs.reifyValues());
  }
}
class BNodeInternal extends BNode {
  /**
   * This does not mark `children` as shared, so it is the responsibility of the caller
   * to ensure children are either marked shared, or aren't included in another tree.
   */
  constructor(children, keys) {
    if (!keys) {
      keys = [];
      for (let i = 0; i < children.length; i++) keys[i] = children[i].maxKey();
    }
    super(keys);
    this.children = children;
  }
  minKey() {
    return this.children[0].minKey();
  }
  minPair(reusedArray) {
    return this.children[0].minPair(reusedArray);
  }
  maxPair(reusedArray) {
    return this.children[this.children.length - 1].maxPair(reusedArray);
  }
  get(key, defaultValue, tree) {
    const i = this.indexOf(key, 0, tree._compare), children = this.children;
    return i < children.length ? children[i].get(key, defaultValue, tree) : void 0;
  }
  getPairOrNextLower(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, 0, compare), children = this.children;
    if (i >= children.length) return this.maxPair(reusedArray);
    const result = children[i].getPairOrNextLower(
      key,
      compare,
      inclusive,
      reusedArray
    );
    if (result === void 0 && i > 0) {
      return children[i - 1].maxPair(reusedArray);
    }
    return result;
  }
  getPairOrNextHigher(key, compare, inclusive, reusedArray) {
    const i = this.indexOf(key, 0, compare), children = this.children, length = children.length;
    if (i >= length) return void 0;
    const result = children[i].getPairOrNextHigher(
      key,
      compare,
      inclusive,
      reusedArray
    );
    if (result === void 0 && i < length - 1) {
      return children[i + 1].minPair(reusedArray);
    }
    return result;
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Internal Node: set & node splitting //////////////////////////////////////
  set(key, value, overwrite, tree) {
    const c = this.children, max2 = tree._maxNodeSize, cmp = tree._compare;
    let i = Math.min(this.indexOf(key, 0, cmp), c.length - 1), child = c[i];
    if (child.isShared) c[i] = child = child.clone();
    if (child.keys.length >= max2) {
      let other;
      if (i > 0 && (other = c[i - 1]).keys.length < max2 && cmp(child.keys[0], key) < 0) {
        if (other.isShared) c[i - 1] = other = other.clone();
        other.takeFromRight(child);
        this.keys[i - 1] = other.maxKey();
      } else if ((other = c[i + 1]) !== void 0 && other.keys.length < max2 && cmp(child.maxKey(), key) < 0) {
        if (other.isShared) c[i + 1] = other = other.clone();
        other.takeFromLeft(child);
        this.keys[i] = c[i].maxKey();
      }
    }
    const result = child.set(key, value, overwrite, tree);
    if (result === false) return false;
    this.keys[i] = child.maxKey();
    if (result === true) return true;
    if (this.keys.length < max2) {
      this.insert(i + 1, result);
      return true;
    } else {
      const newRightSibling = this.splitOffRightSide();
      let target = this;
      if (cmp(result.maxKey(), this.maxKey()) > 0) {
        target = newRightSibling;
        i -= this.keys.length;
      }
      target.insert(i + 1, result);
      return newRightSibling;
    }
  }
  /**
   * Inserts `child` at index `i`.
   * This does not mark `child` as shared, so it is the responsibility of the caller
   * to ensure that either child is marked shared, or it is not included in another tree.
   */
  insert(i, child) {
    this.children.splice(i, 0, child);
    this.keys.splice(i, 0, child.maxKey());
  }
  /**
   * Split this node.
   * Modifies this to remove the second half of the items, returning a separate node containing them.
   */
  splitOffRightSide() {
    const half = this.children.length >> 1;
    return new BNodeInternal(
      this.children.splice(half),
      this.keys.splice(half)
    );
  }
  takeFromRight(rhs) {
    this.keys.push(rhs.keys.shift());
    this.children.push(rhs.children.shift());
  }
  takeFromLeft(lhs) {
    this.keys.unshift(lhs.keys.pop());
    this.children.unshift(lhs.children.pop());
  }
  // ///////////////////////////////////////////////////////////////////////////
  // Internal Node: scanning & deletions //////////////////////////////////////
  // Note: `count` is the next value of the third argument to `onFound`.
  //       A leaf node's `forRange` function returns a new value for this counter,
  //       unless the operation is to stop early.
  forRange(low, high, includeHigh, editMode, tree, count2, onFound) {
    const cmp = tree._compare;
    const keys = this.keys, children = this.children;
    let iLow = this.indexOf(low, 0, cmp), i = iLow;
    const iHigh = Math.min(
      high === low ? iLow : this.indexOf(high, 0, cmp),
      keys.length - 1
    );
    if (!editMode) {
      for (; i <= iHigh; i++) {
        const result = children[i].forRange(
          low,
          high,
          includeHigh,
          editMode,
          tree,
          count2,
          onFound
        );
        if (typeof result !== `number`) return result;
        count2 = result;
      }
    } else if (i <= iHigh) {
      try {
        for (; i <= iHigh; i++) {
          if (children[i].isShared) children[i] = children[i].clone();
          const result = children[i].forRange(
            low,
            high,
            includeHigh,
            editMode,
            tree,
            count2,
            onFound
          );
          keys[i] = children[i].maxKey();
          if (typeof result !== `number`) return result;
          count2 = result;
        }
      } finally {
        const half = tree._maxNodeSize >> 1;
        if (iLow > 0) iLow--;
        for (i = iHigh; i >= iLow; i--) {
          if (children[i].keys.length <= half) {
            if (children[i].keys.length !== 0) {
              this.tryMerge(i, tree._maxNodeSize);
            } else {
              keys.splice(i, 1);
              children.splice(i, 1);
            }
          }
        }
        if (children.length !== 0 && children[0].keys.length === 0)
          check(false, `emptiness bug`);
      }
    }
    return count2;
  }
  /** Merges child i with child i+1 if their combined size is not too large */
  tryMerge(i, maxSize) {
    const children = this.children;
    if (i >= 0 && i + 1 < children.length) {
      if (children[i].keys.length + children[i + 1].keys.length <= maxSize) {
        if (children[i].isShared)
          children[i] = children[i].clone();
        children[i].mergeSibling(children[i + 1], maxSize);
        children.splice(i + 1, 1);
        this.keys.splice(i + 1, 1);
        this.keys[i] = children[i].maxKey();
        return true;
      }
    }
    return false;
  }
  /**
   * Move children from `rhs` into this.
   * `rhs` must be part of this tree, and be removed from it after this call
   * (otherwise isShared for its children could be incorrect).
   */
  mergeSibling(rhs, maxNodeSize) {
    const oldLength = this.keys.length;
    this.keys.push.apply(this.keys, rhs.keys);
    const rhsChildren = rhs.children;
    this.children.push.apply(this.children, rhsChildren);
    if (rhs.isShared && !this.isShared) {
      for (const child of rhsChildren) child.isShared = true;
    }
    this.tryMerge(oldLength - 1, maxNodeSize);
  }
}
const undefVals = [];
const Delete = { delete: true }, DeleteRange = () => Delete;
const EmptyLeaf = (function() {
  const n = new BNode();
  n.isShared = true;
  return n;
})();
const ReusedArray = [];
function check(fact, ...args) {
  {
    args.unshift(`B+ tree`);
    throw new Error(args.join(` `));
  }
}
function createSingleRowRefProxy() {
  const cache = /* @__PURE__ */ new Map();
  function createProxy(path) {
    const pathKey = path.join(`.`);
    if (cache.has(pathKey)) {
      return cache.get(pathKey);
    }
    const proxy = new Proxy({}, {
      get(target, prop, receiver) {
        if (prop === `__refProxy`) return true;
        if (prop === `__path`) return path;
        if (prop === `__type`) return void 0;
        if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
        const newPath = [...path, String(prop)];
        return createProxy(newPath);
      },
      has(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`)
          return true;
        return Reflect.has(target, prop);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
          return { enumerable: false, configurable: true };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      }
    });
    cache.set(pathKey, proxy);
    return proxy;
  }
  return createProxy([]);
}
function createRefProxy(aliases) {
  const cache = /* @__PURE__ */ new Map();
  let accessId = 0;
  function createProxy(path) {
    const pathKey = path.join(`.`);
    if (cache.has(pathKey)) {
      return cache.get(pathKey);
    }
    const proxy = new Proxy({}, {
      get(target, prop, receiver) {
        if (prop === `__refProxy`) return true;
        if (prop === `__path`) return path;
        if (prop === `__type`) return void 0;
        if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
        const newPath = [...path, String(prop)];
        return createProxy(newPath);
      },
      has(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`)
          return true;
        return Reflect.has(target, prop);
      },
      ownKeys(target) {
        const id = ++accessId;
        const sentinelKey = `__SPREAD_SENTINEL__${path.join(`.`)}__${id}`;
        if (!Object.prototype.hasOwnProperty.call(target, sentinelKey)) {
          Object.defineProperty(target, sentinelKey, {
            enumerable: true,
            configurable: true,
            value: true
          });
        }
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
          return { enumerable: false, configurable: true };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      }
    });
    cache.set(pathKey, proxy);
    return proxy;
  }
  const rootProxy = new Proxy({}, {
    get(target, prop, receiver) {
      if (prop === `__refProxy`) return true;
      if (prop === `__path`) return [];
      if (prop === `__type`) return void 0;
      if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
      const propStr = String(prop);
      if (aliases.includes(propStr)) {
        return createProxy([propStr]);
      }
      return void 0;
    },
    has(target, prop) {
      if (prop === `__refProxy` || prop === `__path` || prop === `__type`)
        return true;
      if (typeof prop === `string` && aliases.includes(prop)) return true;
      return Reflect.has(target, prop);
    },
    ownKeys(_target) {
      return [...aliases, `__refProxy`, `__path`, `__type`];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
        return { enumerable: false, configurable: true };
      }
      if (typeof prop === `string` && aliases.includes(prop)) {
        return { enumerable: true, configurable: true };
      }
      return void 0;
    }
  });
  return rootProxy;
}
function createRefProxyWithSelected(aliases) {
  const baseProxy = createRefProxy(aliases);
  const cache = /* @__PURE__ */ new Map();
  function createSelectedProxy(path) {
    const pathKey = path.join(`.`);
    if (cache.has(pathKey)) {
      return cache.get(pathKey);
    }
    const proxy = new Proxy({}, {
      get(target, prop, receiver) {
        if (prop === `__refProxy`) return true;
        if (prop === `__path`) return [`$selected`, ...path];
        if (prop === `__type`) return void 0;
        if (typeof prop === `symbol`) return Reflect.get(target, prop, receiver);
        const newPath = [...path, String(prop)];
        return createSelectedProxy(newPath);
      },
      has(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`)
          return true;
        return Reflect.has(target, prop);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target);
      },
      getOwnPropertyDescriptor(target, prop) {
        if (prop === `__refProxy` || prop === `__path` || prop === `__type`) {
          return { enumerable: false, configurable: true };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      }
    });
    cache.set(pathKey, proxy);
    return proxy;
  }
  const wrappedSelectedProxy = createSelectedProxy([]);
  return new Proxy(baseProxy, {
    get(target, prop, receiver) {
      if (prop === `$selected`) {
        return wrappedSelectedProxy;
      }
      return Reflect.get(target, prop, receiver);
    },
    has(target, prop) {
      if (prop === `$selected`) return true;
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return [...Reflect.ownKeys(target), `$selected`];
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop === `$selected`) {
        return {
          enumerable: true,
          configurable: true,
          value: wrappedSelectedProxy
        };
      }
      return Reflect.getOwnPropertyDescriptor(target, prop);
    }
  });
}
function toExpression(value) {
  if (isRefProxy(value)) {
    return new PropRef(value.__path);
  }
  if (value && typeof value === `object` && `type` in value && (value.type === `func` || value.type === `ref` || value.type === `val` || value.type === `agg`)) {
    return value;
  }
  return new Value(value);
}
function isRefProxy(value) {
  return value && typeof value === `object` && value.__refProxy === true;
}
function eq(left, right) {
  return new Func(`eq`, [toExpression(left), toExpression(right)]);
}
function gt(left, right) {
  return new Func(`gt`, [toExpression(left), toExpression(right)]);
}
function gte(left, right) {
  return new Func(`gte`, [toExpression(left), toExpression(right)]);
}
function lt(left, right) {
  return new Func(`lt`, [toExpression(left), toExpression(right)]);
}
function and(left, right, ...rest) {
  const allArgs = [left, right, ...rest];
  return new Func(
    `and`,
    allArgs.map((arg) => toExpression(arg))
  );
}
function or(left, right, ...rest) {
  const allArgs = [left, right, ...rest];
  return new Func(
    `or`,
    allArgs.map((arg) => toExpression(arg))
  );
}
function inArray(value, array) {
  return new Func(`in`, [toExpression(value), toExpression(array)]);
}
class BaseIndex {
  constructor(id, expression, name, options) {
    this.lookupCount = 0;
    this.totalLookupTime = 0;
    this.lastUpdated = /* @__PURE__ */ new Date();
    this.id = id;
    this.expression = expression;
    this.compareOptions = DEFAULT_COMPARE_OPTIONS;
    this.name = name;
    this.initialize(options);
  }
  // Common methods
  supports(operation) {
    return this.supportedOperations.has(operation);
  }
  matchesField(fieldPath) {
    return this.expression.type === `ref` && this.expression.path.length === fieldPath.length && this.expression.path.every((part, i) => part === fieldPath[i]);
  }
  /**
   * Checks if the compare options match the index's compare options.
   * The direction is ignored because the index can be reversed if the direction is different.
   */
  matchesCompareOptions(compareOptions) {
    const thisCompareOptionsWithoutDirection = {
      ...this.compareOptions,
      direction: void 0
    };
    const compareOptionsWithoutDirection = {
      ...compareOptions,
      direction: void 0
    };
    return deepEquals(
      thisCompareOptionsWithoutDirection,
      compareOptionsWithoutDirection
    );
  }
  /**
   * Checks if the index matches the provided direction.
   */
  matchesDirection(direction) {
    return this.compareOptions.direction === direction;
  }
  getStats() {
    return {
      entryCount: this.keyCount,
      lookupCount: this.lookupCount,
      averageLookupTime: this.lookupCount > 0 ? this.totalLookupTime / this.lookupCount : 0,
      lastUpdated: this.lastUpdated
    };
  }
  evaluateIndexExpression(item) {
    const evaluator = compileSingleRowExpression(this.expression);
    return evaluator(item);
  }
  trackLookup(startTime) {
    const duration = performance.now() - startTime;
    this.lookupCount++;
    this.totalLookupTime += duration;
  }
  updateTimestamp() {
    this.lastUpdated = /* @__PURE__ */ new Date();
  }
}
class BTreeIndex extends BaseIndex {
  constructor(id, expression, name, options) {
    super(id, expression, name, options);
    this.supportedOperations = /* @__PURE__ */ new Set([
      `eq`,
      `gt`,
      `gte`,
      `lt`,
      `lte`,
      `in`
    ]);
    this.valueMap = /* @__PURE__ */ new Map();
    this.indexedKeys = /* @__PURE__ */ new Set();
    this.compareFn = defaultComparator;
    const baseCompareFn = options?.compareFn ?? defaultComparator;
    this.compareFn = (a, b) => baseCompareFn(denormalizeUndefined(a), denormalizeUndefined(b));
    if (options?.compareOptions) {
      this.compareOptions = options.compareOptions;
    }
    this.orderedEntries = new BTree(this.compareFn);
  }
  initialize(_options) {
  }
  /**
   * Adds a value to the index
   */
  add(key, item) {
    let indexedValue2;
    try {
      indexedValue2 = this.evaluateIndexExpression(item);
    } catch (error) {
      throw new Error(
        `Failed to evaluate index expression for key ${key}: ${error}`
      );
    }
    const normalizedValue = normalizeForBTree(indexedValue2);
    if (this.valueMap.has(normalizedValue)) {
      this.valueMap.get(normalizedValue).add(key);
    } else {
      const keySet = /* @__PURE__ */ new Set([key]);
      this.valueMap.set(normalizedValue, keySet);
      this.orderedEntries.set(normalizedValue, void 0);
    }
    this.indexedKeys.add(key);
    this.updateTimestamp();
  }
  /**
   * Removes a value from the index
   */
  remove(key, item) {
    let indexedValue2;
    try {
      indexedValue2 = this.evaluateIndexExpression(item);
    } catch (error) {
      console.warn(
        `Failed to evaluate index expression for key ${key} during removal:`,
        error
      );
      return;
    }
    const normalizedValue = normalizeForBTree(indexedValue2);
    if (this.valueMap.has(normalizedValue)) {
      const keySet = this.valueMap.get(normalizedValue);
      keySet.delete(key);
      if (keySet.size === 0) {
        this.valueMap.delete(normalizedValue);
        this.orderedEntries.delete(normalizedValue);
      }
    }
    this.indexedKeys.delete(key);
    this.updateTimestamp();
  }
  /**
   * Updates a value in the index
   */
  update(key, oldItem, newItem) {
    this.remove(key, oldItem);
    this.add(key, newItem);
  }
  /**
   * Builds the index from a collection of entries
   */
  build(entries) {
    this.clear();
    for (const [key, item] of entries) {
      this.add(key, item);
    }
  }
  /**
   * Clears all data from the index
   */
  clear() {
    this.orderedEntries.clear();
    this.valueMap.clear();
    this.indexedKeys.clear();
    this.updateTimestamp();
  }
  /**
   * Performs a lookup operation
   */
  lookup(operation, value) {
    const startTime = performance.now();
    let result;
    switch (operation) {
      case `eq`:
        result = this.equalityLookup(value);
        break;
      case `gt`:
        result = this.rangeQuery({ from: value, fromInclusive: false });
        break;
      case `gte`:
        result = this.rangeQuery({ from: value, fromInclusive: true });
        break;
      case `lt`:
        result = this.rangeQuery({ to: value, toInclusive: false });
        break;
      case `lte`:
        result = this.rangeQuery({ to: value, toInclusive: true });
        break;
      case `in`:
        result = this.inArrayLookup(value);
        break;
      default:
        throw new Error(`Operation ${operation} not supported by BTreeIndex`);
    }
    this.trackLookup(startTime);
    return result;
  }
  /**
   * Gets the number of indexed keys
   */
  get keyCount() {
    return this.indexedKeys.size;
  }
  // Public methods for backward compatibility (used by tests)
  /**
   * Performs an equality lookup
   */
  equalityLookup(value) {
    const normalizedValue = normalizeForBTree(value);
    return new Set(this.valueMap.get(normalizedValue) ?? []);
  }
  /**
   * Performs a range query with options
   * This is more efficient for compound queries like "WHERE a > 5 AND a < 10"
   */
  rangeQuery(options = {}) {
    const { from, to, fromInclusive = true, toInclusive = true } = options;
    const result = /* @__PURE__ */ new Set();
    const hasFrom = `from` in options;
    const hasTo = `to` in options;
    const fromKey = hasFrom ? normalizeForBTree(from) : this.orderedEntries.minKey();
    const toKey = hasTo ? normalizeForBTree(to) : this.orderedEntries.maxKey();
    this.orderedEntries.forRange(
      fromKey,
      toKey,
      toInclusive,
      (indexedValue2, _) => {
        if (!fromInclusive && this.compareFn(indexedValue2, from) === 0) {
          return;
        }
        const keys = this.valueMap.get(indexedValue2);
        if (keys) {
          keys.forEach((key) => result.add(key));
        }
      }
    );
    return result;
  }
  /**
   * Performs a reversed range query
   */
  rangeQueryReversed(options = {}) {
    const { from, to, fromInclusive = true, toInclusive = true } = options;
    const hasFrom = `from` in options;
    const hasTo = `to` in options;
    return this.rangeQuery({
      from: hasTo ? to : this.orderedEntries.maxKey(),
      to: hasFrom ? from : this.orderedEntries.minKey(),
      fromInclusive: toInclusive,
      toInclusive: fromInclusive
    });
  }
  /**
   * Internal method for taking items from the index.
   * @param n - The number of items to return
   * @param nextPair - Function to get the next pair from the BTree
   * @param from - Already normalized! undefined means "start from beginning/end", sentinel means "start from the key undefined"
   * @param filterFn - Optional filter function
   * @param reversed - Whether to reverse the order of keys within each value
   */
  takeInternal(n, nextPair, from, filterFn, reversed = false) {
    const keysInResult = /* @__PURE__ */ new Set();
    const result = [];
    let pair;
    let key = from;
    while ((pair = nextPair(key)) !== void 0 && result.length < n) {
      key = pair[0];
      const keys = this.valueMap.get(key);
      if (keys && keys.size > 0) {
        const sorted = Array.from(keys).sort(compareKeys);
        if (reversed) sorted.reverse();
        for (const ks of sorted) {
          if (result.length >= n) break;
          if (!keysInResult.has(ks) && (filterFn?.(ks) ?? true)) {
            result.push(ks);
            keysInResult.add(ks);
          }
        }
      }
    }
    return result;
  }
  /**
   * Returns the next n items after the provided item.
   * @param n - The number of items to return
   * @param from - The item to start from (exclusive).
   * @returns The next n items after the provided key.
   */
  take(n, from, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextHigherPair(k);
    const normalizedFrom = normalizeForBTree(from);
    return this.takeInternal(n, nextPair, normalizedFrom, filterFn);
  }
  /**
   * Returns the first n items from the beginning.
   * @param n - The number of items to return
   * @param filterFn - Optional filter function
   * @returns The first n items
   */
  takeFromStart(n, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextHigherPair(k);
    return this.takeInternal(n, nextPair, void 0, filterFn);
  }
  /**
   * Returns the next n items **before** the provided item (in descending order).
   * @param n - The number of items to return
   * @param from - The item to start from (exclusive). Required.
   * @returns The next n items **before** the provided key.
   */
  takeReversed(n, from, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextLowerPair(k);
    const normalizedFrom = normalizeForBTree(from);
    return this.takeInternal(n, nextPair, normalizedFrom, filterFn, true);
  }
  /**
   * Returns the last n items from the end.
   * @param n - The number of items to return
   * @param filterFn - Optional filter function
   * @returns The last n items
   */
  takeReversedFromEnd(n, filterFn) {
    const nextPair = (k) => this.orderedEntries.nextLowerPair(k);
    return this.takeInternal(n, nextPair, void 0, filterFn, true);
  }
  /**
   * Performs an IN array lookup
   */
  inArrayLookup(values) {
    const result = /* @__PURE__ */ new Set();
    for (const value of values) {
      const normalizedValue = normalizeForBTree(value);
      const keys = this.valueMap.get(normalizedValue);
      if (keys) {
        keys.forEach((key) => result.add(key));
      }
    }
    return result;
  }
  // Getter methods for testing compatibility
  get indexedKeysSet() {
    return this.indexedKeys;
  }
  get orderedEntriesArray() {
    return this.orderedEntries.keysArray().map((key) => [
      denormalizeUndefined(key),
      this.valueMap.get(key) ?? /* @__PURE__ */ new Set()
    ]);
  }
  get orderedEntriesArrayReversed() {
    return this.takeReversedFromEnd(this.orderedEntries.size).map((key) => [
      denormalizeUndefined(key),
      this.valueMap.get(key) ?? /* @__PURE__ */ new Set()
    ]);
  }
  get valueMapData() {
    const result = /* @__PURE__ */ new Map();
    for (const [key, value] of this.valueMap) {
      result.set(denormalizeUndefined(key), value);
    }
    return result;
  }
}
function shouldAutoIndex(collection) {
  if (collection.config.autoIndex !== `eager`) {
    return false;
  }
  return true;
}
function ensureIndexForField(fieldName, fieldPath, collection, compareOptions, compareFn) {
  if (!shouldAutoIndex(collection)) {
    return;
  }
  const compareOpts = compareOptions ?? {
    ...DEFAULT_COMPARE_OPTIONS,
    ...collection.compareOptions
  };
  const existingIndex = Array.from(collection.indexes.values()).find(
    (index) => index.matchesField(fieldPath) && index.matchesCompareOptions(compareOpts)
  );
  if (existingIndex) {
    return;
  }
  try {
    collection.createIndex(
      (row) => {
        let current = row;
        for (const part of fieldPath) {
          current = current[part];
        }
        return current;
      },
      {
        name: `auto:${fieldPath.join(`.`)}`,
        indexType: BTreeIndex,
        options: compareFn ? { compareFn, compareOptions: compareOpts } : {}
      }
    );
  } catch (error) {
    console.warn(
      `${collection.id ? `[${collection.id}] ` : ``}Failed to create auto-index for field path "${fieldPath.join(`.`)}":`,
      error
    );
  }
}
function ensureIndexForExpression(expression, collection) {
  if (!shouldAutoIndex(collection)) {
    return;
  }
  const indexableExpressions = extractIndexableExpressions(expression);
  for (const { fieldName, fieldPath } of indexableExpressions) {
    ensureIndexForField(fieldName, fieldPath, collection);
  }
}
function extractIndexableExpressions(expression) {
  const results = [];
  function extractFromExpression(expr) {
    if (expr.type !== `func`) {
      return;
    }
    const func = expr;
    if (func.name === `and`) {
      for (const arg of func.args) {
        extractFromExpression(arg);
      }
      return;
    }
    const supportedOperations = [`eq`, `gt`, `gte`, `lt`, `lte`, `in`];
    if (!supportedOperations.includes(func.name)) {
      return;
    }
    if (func.args.length < 1 || func.args[0].type !== `ref`) {
      return;
    }
    const fieldRef = func.args[0];
    const fieldPath = fieldRef.path;
    if (fieldPath.length === 0) {
      return;
    }
    const fieldName = fieldPath.join(`_`);
    results.push({ fieldName, fieldPath });
  }
  extractFromExpression(expression);
  return results;
}
const { sum, count: count$1, avg, min, max } = groupByOperators;
function validateAndCreateMapping(groupByClause, selectClause) {
  const selectToGroupByIndex = /* @__PURE__ */ new Map();
  const groupByExpressions = [...groupByClause];
  if (!selectClause) {
    return { selectToGroupByIndex, groupByExpressions };
  }
  for (const [alias, expr] of Object.entries(selectClause)) {
    if (expr.type === `agg` || containsAggregate(expr)) {
      continue;
    }
    const groupIndex = groupByExpressions.findIndex(
      (groupExpr) => expressionsEqual(expr, groupExpr)
    );
    if (groupIndex === -1) {
      throw new NonAggregateExpressionNotInGroupByError(alias);
    }
    selectToGroupByIndex.set(alias, groupIndex);
  }
  return { selectToGroupByIndex, groupByExpressions };
}
function processGroupBy(pipeline, groupByClause, havingClauses, selectClause, fnHavingClauses) {
  if (groupByClause.length === 0) {
    const aggregates2 = {};
    const wrappedAggExprs2 = {};
    const aggCounter2 = { value: 0 };
    if (selectClause) {
      for (const [alias, expr] of Object.entries(selectClause)) {
        if (expr.type === `agg`) {
          aggregates2[alias] = getAggregateFunction(expr);
        } else if (containsAggregate(expr)) {
          const { transformed, extracted } = extractAndReplaceAggregates(
            expr,
            aggCounter2
          );
          for (const [syntheticAlias, aggExpr] of Object.entries(extracted)) {
            aggregates2[syntheticAlias] = getAggregateFunction(aggExpr);
          }
          wrappedAggExprs2[alias] = compileExpression(transformed);
        }
      }
    }
    const keyExtractor2 = () => ({ __singleGroup: true });
    pipeline = pipeline.pipe(
      groupBy(keyExtractor2, aggregates2)
    );
    pipeline = pipeline.pipe(
      map(([, aggregatedRow]) => {
        const selectResults = aggregatedRow.$selected || {};
        const finalResults = { ...selectResults };
        if (selectClause) {
          for (const [alias, expr] of Object.entries(selectClause)) {
            if (expr.type === `agg`) {
              finalResults[alias] = aggregatedRow[alias];
            }
          }
          evaluateWrappedAggregates(
            finalResults,
            aggregatedRow,
            wrappedAggExprs2
          );
        }
        return [
          `single_group`,
          {
            ...aggregatedRow,
            $selected: finalResults
          }
        ];
      })
    );
    if (havingClauses && havingClauses.length > 0) {
      for (const havingClause of havingClauses) {
        const havingExpression = getHavingExpression(havingClause);
        const transformedHavingClause = replaceAggregatesByRefs(
          havingExpression,
          selectClause || {},
          `$selected`
        );
        const compiledHaving = compileExpression(transformedHavingClause);
        pipeline = pipeline.pipe(
          filter(([, row]) => {
            const namespacedRow = { $selected: row.$selected };
            return toBooleanPredicate(compiledHaving(namespacedRow));
          })
        );
      }
    }
    if (fnHavingClauses && fnHavingClauses.length > 0) {
      for (const fnHaving of fnHavingClauses) {
        pipeline = pipeline.pipe(
          filter(([, row]) => {
            const namespacedRow = { $selected: row.$selected };
            return toBooleanPredicate(fnHaving(namespacedRow));
          })
        );
      }
    }
    return pipeline;
  }
  const mapping = validateAndCreateMapping(groupByClause, selectClause);
  const compiledGroupByExpressions = groupByClause.map(
    (e) => compileExpression(e)
  );
  const keyExtractor = ([, row]) => {
    const namespacedRow = { ...row };
    delete namespacedRow.$selected;
    const key = {};
    for (let i = 0; i < groupByClause.length; i++) {
      const compiledExpr = compiledGroupByExpressions[i];
      const value = compiledExpr(namespacedRow);
      key[`__key_${i}`] = value;
    }
    return key;
  };
  const aggregates = {};
  const wrappedAggExprs = {};
  const aggCounter = { value: 0 };
  if (selectClause) {
    for (const [alias, expr] of Object.entries(selectClause)) {
      if (expr.type === `agg`) {
        aggregates[alias] = getAggregateFunction(expr);
      } else if (containsAggregate(expr)) {
        const { transformed, extracted } = extractAndReplaceAggregates(
          expr,
          aggCounter
        );
        for (const [syntheticAlias, aggExpr] of Object.entries(extracted)) {
          aggregates[syntheticAlias] = getAggregateFunction(aggExpr);
        }
        wrappedAggExprs[alias] = compileExpression(transformed);
      }
    }
  }
  pipeline = pipeline.pipe(groupBy(keyExtractor, aggregates));
  pipeline = pipeline.pipe(
    map(([, aggregatedRow]) => {
      const selectResults = aggregatedRow.$selected || {};
      const finalResults = {};
      if (selectClause) {
        for (const [alias, expr] of Object.entries(selectClause)) {
          if (expr.type === `agg`) {
            finalResults[alias] = aggregatedRow[alias];
          } else if (!wrappedAggExprs[alias]) {
            const groupIndex = mapping.selectToGroupByIndex.get(alias);
            if (groupIndex !== void 0) {
              finalResults[alias] = aggregatedRow[`__key_${groupIndex}`];
            } else {
              finalResults[alias] = selectResults[alias];
            }
          }
        }
        evaluateWrappedAggregates(
          finalResults,
          aggregatedRow,
          wrappedAggExprs
        );
      } else {
        for (let i = 0; i < groupByClause.length; i++) {
          finalResults[`__key_${i}`] = aggregatedRow[`__key_${i}`];
        }
      }
      let finalKey;
      if (groupByClause.length === 1) {
        finalKey = aggregatedRow[`__key_0`];
      } else {
        const keyParts = [];
        for (let i = 0; i < groupByClause.length; i++) {
          keyParts.push(aggregatedRow[`__key_${i}`]);
        }
        finalKey = serializeValue(keyParts);
      }
      return [
        finalKey,
        {
          ...aggregatedRow,
          $selected: finalResults
        }
      ];
    })
  );
  if (havingClauses && havingClauses.length > 0) {
    for (const havingClause of havingClauses) {
      const havingExpression = getHavingExpression(havingClause);
      const transformedHavingClause = replaceAggregatesByRefs(
        havingExpression,
        selectClause || {}
      );
      const compiledHaving = compileExpression(transformedHavingClause);
      pipeline = pipeline.pipe(
        filter(([, row]) => {
          const namespacedRow = { $selected: row.$selected };
          return compiledHaving(namespacedRow);
        })
      );
    }
  }
  if (fnHavingClauses && fnHavingClauses.length > 0) {
    for (const fnHaving of fnHavingClauses) {
      pipeline = pipeline.pipe(
        filter(([, row]) => {
          const namespacedRow = { $selected: row.$selected };
          return toBooleanPredicate(fnHaving(namespacedRow));
        })
      );
    }
  }
  return pipeline;
}
function expressionsEqual(expr1, expr2) {
  if (!expr1 || !expr2) return false;
  if (expr1.type !== expr2.type) return false;
  switch (expr1.type) {
    case `ref`:
      if (!expr1.path || !expr2.path) return false;
      if (expr1.path.length !== expr2.path.length) return false;
      return expr1.path.every(
        (segment, i) => segment === expr2.path[i]
      );
    case `val`:
      return expr1.value === expr2.value;
    case `func`:
      return expr1.name === expr2.name && expr1.args?.length === expr2.args?.length && (expr1.args || []).every(
        (arg, i) => expressionsEqual(arg, expr2.args[i])
      );
    case `agg`:
      return expr1.name === expr2.name && expr1.args?.length === expr2.args?.length && (expr1.args || []).every(
        (arg, i) => expressionsEqual(arg, expr2.args[i])
      );
    default:
      return false;
  }
}
function getAggregateFunction(aggExpr) {
  const compiledExpr = compileExpression(aggExpr.args[0]);
  const valueExtractor = ([, namespacedRow]) => {
    const value = compiledExpr(namespacedRow);
    if (typeof value === `number`) {
      return value;
    }
    return value != null ? Number(value) : 0;
  };
  const valueExtractorForMinMax = ([, namespacedRow]) => {
    const value = compiledExpr(namespacedRow);
    if (typeof value === `number` || typeof value === `string` || typeof value === `bigint` || value instanceof Date) {
      return value;
    }
    return value != null ? Number(value) : 0;
  };
  const rawValueExtractor = ([, namespacedRow]) => {
    return compiledExpr(namespacedRow);
  };
  switch (aggExpr.name.toLowerCase()) {
    case `sum`:
      return sum(valueExtractor);
    case `count`:
      return count$1(rawValueExtractor);
    case `avg`:
      return avg(valueExtractor);
    case `min`:
      return min(valueExtractorForMinMax);
    case `max`:
      return max(valueExtractorForMinMax);
    default:
      throw new UnsupportedAggregateFunctionError(aggExpr.name);
  }
}
function replaceAggregatesByRefs(havingExpr, selectClause, resultAlias = `$selected`) {
  switch (havingExpr.type) {
    case `agg`: {
      const aggExpr = havingExpr;
      for (const [alias, selectExpr] of Object.entries(selectClause)) {
        if (selectExpr.type === `agg` && aggregatesEqual(aggExpr, selectExpr)) {
          return new PropRef([resultAlias, alias]);
        }
      }
      throw new AggregateFunctionNotInSelectError(aggExpr.name);
    }
    case `func`: {
      const funcExpr = havingExpr;
      const transformedArgs = funcExpr.args.map(
        (arg) => replaceAggregatesByRefs(arg, selectClause)
      );
      return new Func(funcExpr.name, transformedArgs);
    }
    case `ref`:
      return havingExpr;
    case `val`:
      return havingExpr;
    default:
      throw new UnknownHavingExpressionTypeError(havingExpr.type);
  }
}
function evaluateWrappedAggregates(finalResults, aggregatedRow, wrappedAggExprs) {
  for (const key of Object.keys(aggregatedRow)) {
    if (key.startsWith(`__agg_`)) {
      finalResults[key] = aggregatedRow[key];
    }
  }
  for (const [alias, evaluator] of Object.entries(wrappedAggExprs)) {
    finalResults[alias] = evaluator({ $selected: finalResults });
  }
  for (const key of Object.keys(finalResults)) {
    if (key.startsWith(`__agg_`)) delete finalResults[key];
  }
}
function containsAggregate(expr) {
  if (!isExpressionLike(expr)) {
    return false;
  }
  if (expr.type === `agg`) {
    return true;
  }
  if (expr.type === `func`) {
    return expr.args.some(
      (arg) => containsAggregate(arg)
    );
  }
  return false;
}
function extractAndReplaceAggregates(expr, counter) {
  if (expr.type === `agg`) {
    const alias = `__agg_${counter.value++}`;
    return {
      transformed: new PropRef([`$selected`, alias]),
      extracted: { [alias]: expr }
    };
  }
  if (expr.type === `func`) {
    const allExtracted = {};
    const newArgs = expr.args.map((arg) => {
      const result = extractAndReplaceAggregates(arg, counter);
      Object.assign(allExtracted, result.extracted);
      return result.transformed;
    });
    return {
      transformed: new Func(expr.name, newArgs),
      extracted: allExtracted
    };
  }
  return { transformed: expr, extracted: {} };
}
function aggregatesEqual(agg1, agg2) {
  return agg1.name === agg2.name && agg1.args.length === agg2.args.length && agg1.args.every((arg, i) => expressionsEqual(arg, agg2.args[i]));
}
function processOrderBy(rawQuery, pipeline, orderByClause, selectClause, collection, optimizableOrderByCollections, setWindowFn, limit, offset) {
  const compiledOrderBy = orderByClause.map((clause) => {
    const clauseWithoutAggregates = replaceAggregatesByRefs(
      clause.expression,
      selectClause,
      `$selected`
    );
    return {
      compiledExpression: compileExpression(clauseWithoutAggregates),
      compareOptions: buildCompareOptions(clause, collection)
    };
  });
  const valueExtractor = (row) => {
    const orderByContext = row;
    if (orderByClause.length > 1) {
      return compiledOrderBy.map(
        (compiled) => compiled.compiledExpression(orderByContext)
      );
    } else if (orderByClause.length === 1) {
      const compiled = compiledOrderBy[0];
      return compiled.compiledExpression(orderByContext);
    }
    return null;
  };
  const compare = (a, b) => {
    if (orderByClause.length > 1) {
      const arrayA = a;
      const arrayB = b;
      for (let i = 0; i < orderByClause.length; i++) {
        const clause = compiledOrderBy[i];
        const compareFn = makeComparator(clause.compareOptions);
        const result = compareFn(arrayA[i], arrayB[i]);
        if (result !== 0) {
          return result;
        }
      }
      return arrayA.length - arrayB.length;
    }
    if (orderByClause.length === 1) {
      const clause = compiledOrderBy[0];
      const compareFn = makeComparator(clause.compareOptions);
      return compareFn(a, b);
    }
    return defaultComparator(a, b);
  };
  let setSizeCallback;
  let orderByOptimizationInfo;
  if (limit) {
    let index;
    let followRefCollection;
    let firstColumnValueExtractor;
    let orderByAlias = rawQuery.from.alias;
    const firstClause = orderByClause[0];
    const firstOrderByExpression = firstClause.expression;
    if (firstOrderByExpression.type === `ref`) {
      const followRefResult = followRef(
        rawQuery,
        firstOrderByExpression,
        collection
      );
      if (followRefResult) {
        followRefCollection = followRefResult.collection;
        const fieldName = followRefResult.path[0];
        const compareOpts = buildCompareOptions(
          firstClause,
          followRefCollection
        );
        if (fieldName) {
          ensureIndexForField(
            fieldName,
            followRefResult.path,
            followRefCollection,
            compareOpts,
            compare
          );
        }
        firstColumnValueExtractor = compileExpression(
          new PropRef(followRefResult.path),
          true
        );
        index = findIndexForField(
          followRefCollection,
          followRefResult.path,
          compareOpts
        );
        if (!index?.supports(`gt`)) {
          index = void 0;
        }
        orderByAlias = firstOrderByExpression.path.length > 1 ? String(firstOrderByExpression.path[0]) : rawQuery.from.alias;
      }
    }
    if (!firstColumnValueExtractor) ;
    else {
      const allColumnsAreRefs = orderByClause.every(
        (clause) => clause.expression.type === `ref`
      );
      const allColumnExtractors = allColumnsAreRefs ? orderByClause.map((clause) => {
        const refExpr = clause.expression;
        const followResult = followRef(rawQuery, refExpr, collection);
        if (followResult) {
          return compileExpression(
            new PropRef(followResult.path),
            true
          );
        }
        return compileExpression(
          clause.expression,
          true
        );
      }) : void 0;
      const comparator = (a, b) => {
        if (orderByClause.length === 1) {
          const extractedA = a ? firstColumnValueExtractor(a) : a;
          const extractedB = b ? firstColumnValueExtractor(b) : b;
          return compare(extractedA, extractedB);
        }
        if (allColumnExtractors) {
          const extractAll = (row) => {
            if (!row) return row;
            return allColumnExtractors.map((extractor) => extractor(row));
          };
          return compare(extractAll(a), extractAll(b));
        }
        return 0;
      };
      const rawRowValueExtractor = (row) => {
        if (orderByClause.length === 1) {
          return firstColumnValueExtractor(row);
        }
        if (allColumnExtractors) {
          return allColumnExtractors.map((extractor) => extractor(row));
        }
        return void 0;
      };
      orderByOptimizationInfo = {
        alias: orderByAlias,
        offset: offset ?? 0,
        limit,
        comparator,
        valueExtractorForRawRow: rawRowValueExtractor,
        firstColumnValueExtractor,
        index,
        orderBy: orderByClause
      };
      const targetCollectionId = followRefCollection?.id ?? collection.id;
      optimizableOrderByCollections[targetCollectionId] = orderByOptimizationInfo;
      if (index) {
        setSizeCallback = (getSize) => {
          optimizableOrderByCollections[targetCollectionId][`dataNeeded`] = () => {
            const size = getSize();
            return Math.max(0, orderByOptimizationInfo.limit - size);
          };
        };
      }
    }
  }
  return pipeline.pipe(
    orderByWithFractionalIndex(valueExtractor, {
      limit,
      offset,
      comparator: compare,
      setSizeCallback,
      setWindowFn: (windowFn) => {
        setWindowFn(
          // We wrap the move function such that we update the orderByOptimizationInfo
          // because that is used by the `dataNeeded` callback to determine if we need to load more data
          (options) => {
            windowFn(options);
            if (orderByOptimizationInfo) {
              orderByOptimizationInfo.offset = options.offset ?? orderByOptimizationInfo.offset;
              orderByOptimizationInfo.limit = options.limit ?? orderByOptimizationInfo.limit;
            }
          }
        );
      }
    })
    // orderByWithFractionalIndex returns [key, [value, index]] - we keep this format
  );
}
function buildCompareOptions(clause, collection) {
  if (clause.compareOptions.stringSort !== void 0) {
    return clause.compareOptions;
  }
  return {
    ...collection.compareOptions,
    direction: clause.compareOptions.direction,
    nulls: clause.compareOptions.nulls
  };
}
function currentStateAsChanges(collection, options = {}) {
  const collectFilteredResults = (filterFn) => {
    const result = [];
    for (const [key, value] of collection.entries()) {
      if (filterFn?.(value) ?? true) {
        result.push({
          type: `insert`,
          key,
          value
        });
      }
    }
    return result;
  };
  if (options.limit !== void 0 && !options.orderBy) {
    throw new Error(`limit cannot be used without orderBy`);
  }
  if (options.orderBy) {
    const whereFilter = options.where ? createFilterFunctionFromExpression(options.where) : void 0;
    const orderedKeys = getOrderedKeys(
      collection,
      options.orderBy,
      options.limit,
      whereFilter,
      options.optimizedOnly
    );
    if (orderedKeys === void 0) {
      return;
    }
    const result = [];
    for (const key of orderedKeys) {
      const value = collection.get(key);
      if (value !== void 0) {
        result.push({
          type: `insert`,
          key,
          value
        });
      }
    }
    return result;
  }
  if (!options.where) {
    return collectFilteredResults();
  }
  try {
    const expression = options.where;
    const optimizationResult = optimizeExpressionWithIndexes(
      expression,
      collection
    );
    if (optimizationResult.canOptimize) {
      const result = [];
      for (const key of optimizationResult.matchingKeys) {
        const value = collection.get(key);
        if (value !== void 0) {
          result.push({
            type: `insert`,
            key,
            value
          });
        }
      }
      return result;
    } else {
      if (options.optimizedOnly) {
        return;
      }
      const filterFn = createFilterFunctionFromExpression(expression);
      return collectFilteredResults(filterFn);
    }
  } catch (error) {
    console.warn(
      `${collection.id ? `[${collection.id}] ` : ``}Error processing where clause, falling back to full scan:`,
      error
    );
    const filterFn = createFilterFunctionFromExpression(options.where);
    if (options.optimizedOnly) {
      return;
    }
    return collectFilteredResults(filterFn);
  }
}
function createFilterFunctionFromExpression(expression) {
  const evaluator = compileSingleRowExpression(expression);
  return (item) => {
    try {
      const result = evaluator(item);
      return toBooleanPredicate(result);
    } catch {
      return false;
    }
  };
}
function createFilteredCallback(originalCallback, options) {
  const filterFn = createFilterFunctionFromExpression(options.whereExpression);
  return (changes) => {
    const filteredChanges = [];
    for (const change of changes) {
      if (change.type === `insert`) {
        if (filterFn(change.value)) {
          filteredChanges.push(change);
        }
      } else if (change.type === `update`) {
        const newValueMatches = filterFn(change.value);
        const oldValueMatches = change.previousValue ? filterFn(change.previousValue) : false;
        if (newValueMatches && oldValueMatches) {
          filteredChanges.push(change);
        } else if (newValueMatches && !oldValueMatches) {
          filteredChanges.push({
            ...change,
            type: `insert`
          });
        } else if (!newValueMatches && oldValueMatches) {
          filteredChanges.push({
            ...change,
            type: `delete`,
            value: change.previousValue
            // Use the previous value for the delete
          });
        }
      } else {
        if (filterFn(change.value)) {
          filteredChanges.push(change);
        }
      }
    }
    if (filteredChanges.length > 0 || changes.length === 0) {
      originalCallback(filteredChanges);
    }
  };
}
function getOrderedKeys(collection, orderBy, limit, whereFilter, optimizedOnly) {
  if (orderBy.length === 1) {
    const clause = orderBy[0];
    const orderByExpression = clause.expression;
    if (orderByExpression.type === `ref`) {
      const propRef = orderByExpression;
      const fieldPath = propRef.path;
      const compareOpts = buildCompareOptions(clause, collection);
      ensureIndexForField(
        fieldPath[0],
        fieldPath,
        collection,
        compareOpts
      );
      const index = findIndexForField(collection, fieldPath, compareOpts);
      if (index && index.supports(`gt`)) {
        const filterFn = (key) => {
          const value = collection.get(key);
          if (value === void 0) {
            return false;
          }
          return whereFilter?.(value) ?? true;
        };
        return index.takeFromStart(limit ?? index.keyCount, filterFn);
      }
    }
  }
  if (optimizedOnly) {
    return;
  }
  const allItems = [];
  for (const [key, value] of collection.entries()) {
    if (whereFilter?.(value) ?? true) {
      allItems.push({ key, value });
    }
  }
  const compare = (a, b) => {
    for (const clause of orderBy) {
      const compareFn = makeComparator(clause.compareOptions);
      const aValue = extractValueFromItem(a.value, clause.expression);
      const bValue = extractValueFromItem(b.value, clause.expression);
      const result = compareFn(aValue, bValue);
      if (result !== 0) {
        return result;
      }
    }
    return 0;
  };
  allItems.sort(compare);
  const sortedKeys = allItems.map((item) => item.key);
  if (limit !== void 0) {
    return sortedKeys.slice(0, limit);
  }
  return sortedKeys;
}
function extractValueFromItem(item, expression) {
  if (expression.type === `ref`) {
    const propRef = expression;
    let value = item;
    for (const pathPart of propRef.path) {
      value = value?.[pathPart];
    }
    return value;
  } else if (expression.type === `val`) {
    return expression.value;
  } else {
    const evaluator = compileSingleRowExpression(expression);
    return evaluator(item);
  }
}
class SortedMap {
  /**
   * Creates a new SortedMap instance
   *
   * @param comparator - Optional function to compare values for sorting.
   *                     If not provided, entries are sorted by key only.
   */
  constructor(comparator) {
    this.map = /* @__PURE__ */ new Map();
    this.sortedKeys = [];
    this.comparator = comparator;
  }
  /**
   * Finds the index where a key-value pair should be inserted to maintain sort order.
   * Uses binary search to find the correct position based on the value (if comparator provided),
   * with key-based tie-breaking for deterministic ordering when values compare as equal.
   * If no comparator is provided, sorts by key only.
   * Runs in O(log n) time.
   *
   * @param key - The key to find position for (used as tie-breaker or primary sort when no comparator)
   * @param value - The value to compare against (only used if comparator is provided)
   * @returns The index where the key should be inserted
   */
  indexOf(key, value) {
    let left = 0;
    let right = this.sortedKeys.length;
    if (!this.comparator) {
      while (left < right) {
        const mid = Math.floor((left + right) / 2);
        const midKey = this.sortedKeys[mid];
        const keyComparison = compareKeys(key, midKey);
        if (keyComparison < 0) {
          right = mid;
        } else if (keyComparison > 0) {
          left = mid + 1;
        } else {
          return mid;
        }
      }
      return left;
    }
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const midKey = this.sortedKeys[mid];
      const midValue = this.map.get(midKey);
      const valueComparison = this.comparator(value, midValue);
      if (valueComparison < 0) {
        right = mid;
      } else if (valueComparison > 0) {
        left = mid + 1;
      } else {
        const keyComparison = compareKeys(key, midKey);
        if (keyComparison < 0) {
          right = mid;
        } else if (keyComparison > 0) {
          left = mid + 1;
        } else {
          return mid;
        }
      }
    }
    return left;
  }
  /**
   * Sets a key-value pair in the map and maintains sort order
   *
   * @param key - The key to set
   * @param value - The value to associate with the key
   * @returns This SortedMap instance for chaining
   */
  set(key, value) {
    if (this.map.has(key)) {
      const oldValue = this.map.get(key);
      const oldIndex = this.indexOf(key, oldValue);
      this.sortedKeys.splice(oldIndex, 1);
    }
    const index = this.indexOf(key, value);
    this.sortedKeys.splice(index, 0, key);
    this.map.set(key, value);
    return this;
  }
  /**
   * Gets a value by its key
   *
   * @param key - The key to look up
   * @returns The value associated with the key, or undefined if not found
   */
  get(key) {
    return this.map.get(key);
  }
  /**
   * Removes a key-value pair from the map
   *
   * @param key - The key to remove
   * @returns True if the key was found and removed, false otherwise
   */
  delete(key) {
    if (this.map.has(key)) {
      const oldValue = this.map.get(key);
      const index = this.indexOf(key, oldValue);
      this.sortedKeys.splice(index, 1);
      return this.map.delete(key);
    }
    return false;
  }
  /**
   * Checks if a key exists in the map
   *
   * @param key - The key to check
   * @returns True if the key exists, false otherwise
   */
  has(key) {
    return this.map.has(key);
  }
  /**
   * Removes all key-value pairs from the map
   */
  clear() {
    this.map.clear();
    this.sortedKeys = [];
  }
  /**
   * Gets the number of key-value pairs in the map
   */
  get size() {
    return this.map.size;
  }
  /**
   * Default iterator that returns entries in sorted order
   *
   * @returns An iterator for the map's entries
   */
  *[Symbol.iterator]() {
    for (const key of this.sortedKeys) {
      yield [key, this.map.get(key)];
    }
  }
  /**
   * Returns an iterator for the map's entries in sorted order
   *
   * @returns An iterator for the map's entries
   */
  entries() {
    return this[Symbol.iterator]();
  }
  /**
   * Returns an iterator for the map's keys in sorted order
   *
   * @returns An iterator for the map's keys
   */
  keys() {
    return this.sortedKeys[Symbol.iterator]();
  }
  /**
   * Returns an iterator for the map's values in sorted order
   *
   * @returns An iterator for the map's values
   */
  values() {
    return (function* () {
      for (const key of this.sortedKeys) {
        yield this.map.get(key);
      }
    }).call(this);
  }
  /**
   * Executes a callback function for each key-value pair in the map in sorted order
   *
   * @param callbackfn - Function to execute for each entry
   */
  forEach(callbackfn) {
    for (const key of this.sortedKeys) {
      callbackfn(this.map.get(key), key, this.map);
    }
  }
}
class CollectionStateManager {
  /**
   * Creates a new CollectionState manager
   */
  constructor(config) {
    this.pendingSyncedTransactions = [];
    this.syncedMetadata = /* @__PURE__ */ new Map();
    this.optimisticUpserts = /* @__PURE__ */ new Map();
    this.optimisticDeletes = /* @__PURE__ */ new Set();
    this.size = 0;
    this.syncedKeys = /* @__PURE__ */ new Set();
    this.preSyncVisibleState = /* @__PURE__ */ new Map();
    this.recentlySyncedKeys = /* @__PURE__ */ new Set();
    this.hasReceivedFirstCommit = false;
    this.isCommittingSyncTransactions = false;
    this.commitPendingTransactions = () => {
      let hasPersistingTransaction = false;
      for (const transaction of this.transactions.values()) {
        if (transaction.state === `persisting`) {
          hasPersistingTransaction = true;
          break;
        }
      }
      const {
        committedSyncedTransactions,
        uncommittedSyncedTransactions,
        hasTruncateSync,
        hasImmediateSync
      } = this.pendingSyncedTransactions.reduce(
        (acc, t) => {
          if (t.committed) {
            acc.committedSyncedTransactions.push(t);
            if (t.truncate) {
              acc.hasTruncateSync = true;
            }
            if (t.immediate) {
              acc.hasImmediateSync = true;
            }
          } else {
            acc.uncommittedSyncedTransactions.push(t);
          }
          return acc;
        },
        {
          committedSyncedTransactions: [],
          uncommittedSyncedTransactions: [],
          hasTruncateSync: false,
          hasImmediateSync: false
        }
      );
      if (!hasPersistingTransaction || hasTruncateSync || hasImmediateSync) {
        this.isCommittingSyncTransactions = true;
        const truncateOptimisticSnapshot = hasTruncateSync ? committedSyncedTransactions.find((t) => t.truncate)?.optimisticSnapshot : null;
        const changedKeys = /* @__PURE__ */ new Set();
        for (const transaction of committedSyncedTransactions) {
          for (const operation of transaction.operations) {
            changedKeys.add(operation.key);
          }
        }
        let currentVisibleState = this.preSyncVisibleState;
        if (currentVisibleState.size === 0) {
          currentVisibleState = /* @__PURE__ */ new Map();
          for (const key of changedKeys) {
            const currentValue = this.get(key);
            if (currentValue !== void 0) {
              currentVisibleState.set(key, currentValue);
            }
          }
        }
        const events = [];
        const rowUpdateMode = this.config.sync.rowUpdateMode || `partial`;
        for (const transaction of committedSyncedTransactions) {
          if (transaction.truncate) {
            const visibleKeys = /* @__PURE__ */ new Set([
              ...this.syncedData.keys(),
              ...truncateOptimisticSnapshot?.upserts.keys() || []
            ]);
            for (const key of visibleKeys) {
              if (truncateOptimisticSnapshot?.deletes.has(key)) continue;
              const previousValue = truncateOptimisticSnapshot?.upserts.get(key) || this.syncedData.get(key);
              if (previousValue !== void 0) {
                events.push({ type: `delete`, key, value: previousValue });
              }
            }
            this.syncedData.clear();
            this.syncedMetadata.clear();
            this.syncedKeys.clear();
            for (const key of changedKeys) {
              currentVisibleState.delete(key);
            }
            this._events.emit(`truncate`, {
              type: `truncate`,
              collection: this.collection
            });
          }
          for (const operation of transaction.operations) {
            const key = operation.key;
            this.syncedKeys.add(key);
            switch (operation.type) {
              case `insert`:
                this.syncedMetadata.set(key, operation.metadata);
                break;
              case `update`:
                this.syncedMetadata.set(
                  key,
                  Object.assign(
                    {},
                    this.syncedMetadata.get(key),
                    operation.metadata
                  )
                );
                break;
              case `delete`:
                this.syncedMetadata.delete(key);
                break;
            }
            switch (operation.type) {
              case `insert`:
                this.syncedData.set(key, operation.value);
                break;
              case `update`: {
                if (rowUpdateMode === `partial`) {
                  const updatedValue = Object.assign(
                    {},
                    this.syncedData.get(key),
                    operation.value
                  );
                  this.syncedData.set(key, updatedValue);
                } else {
                  this.syncedData.set(key, operation.value);
                }
                break;
              }
              case `delete`:
                this.syncedData.delete(key);
                break;
            }
          }
        }
        if (hasTruncateSync) {
          const syncedInsertedOrUpdatedKeys = /* @__PURE__ */ new Set();
          for (const t of committedSyncedTransactions) {
            for (const op of t.operations) {
              if (op.type === `insert` || op.type === `update`) {
                syncedInsertedOrUpdatedKeys.add(op.key);
              }
            }
          }
          const reapplyUpserts = new Map(
            truncateOptimisticSnapshot.upserts
          );
          const reapplyDeletes = new Set(
            truncateOptimisticSnapshot.deletes
          );
          for (const [key, value] of reapplyUpserts) {
            if (reapplyDeletes.has(key)) continue;
            if (syncedInsertedOrUpdatedKeys.has(key)) {
              let foundInsert = false;
              for (let i = events.length - 1; i >= 0; i--) {
                const evt = events[i];
                if (evt.key === key && evt.type === `insert`) {
                  evt.value = value;
                  foundInsert = true;
                  break;
                }
              }
              if (!foundInsert) {
                events.push({ type: `insert`, key, value });
              }
            } else {
              events.push({ type: `insert`, key, value });
            }
          }
          if (events.length > 0 && reapplyDeletes.size > 0) {
            const filtered = [];
            for (const evt of events) {
              if (evt.type === `insert` && reapplyDeletes.has(evt.key)) {
                continue;
              }
              filtered.push(evt);
            }
            events.length = 0;
            events.push(...filtered);
          }
          if (this.lifecycle.status !== `ready`) {
            this.lifecycle.markReady();
          }
        }
        this.optimisticUpserts.clear();
        this.optimisticDeletes.clear();
        this.isCommittingSyncTransactions = false;
        if (hasTruncateSync && truncateOptimisticSnapshot) {
          for (const [key, value] of truncateOptimisticSnapshot.upserts) {
            this.optimisticUpserts.set(key, value);
          }
          for (const key of truncateOptimisticSnapshot.deletes) {
            this.optimisticDeletes.add(key);
          }
        }
        for (const transaction of this.transactions.values()) {
          if (![`completed`, `failed`].includes(transaction.state)) {
            for (const mutation of transaction.mutations) {
              if (this.isThisCollection(mutation.collection) && mutation.optimistic) {
                switch (mutation.type) {
                  case `insert`:
                  case `update`:
                    this.optimisticUpserts.set(
                      mutation.key,
                      mutation.modified
                    );
                    this.optimisticDeletes.delete(mutation.key);
                    break;
                  case `delete`:
                    this.optimisticUpserts.delete(mutation.key);
                    this.optimisticDeletes.add(mutation.key);
                    break;
                }
              }
            }
          }
        }
        const completedOptimisticOps = /* @__PURE__ */ new Map();
        for (const transaction of this.transactions.values()) {
          if (transaction.state === `completed`) {
            for (const mutation of transaction.mutations) {
              if (mutation.optimistic && this.isThisCollection(mutation.collection) && changedKeys.has(mutation.key)) {
                completedOptimisticOps.set(mutation.key, {
                  type: mutation.type,
                  value: mutation.modified
                });
              }
            }
          }
        }
        for (const key of changedKeys) {
          const previousVisibleValue = currentVisibleState.get(key);
          const newVisibleValue = this.get(key);
          const completedOp = completedOptimisticOps.get(key);
          let isRedundantSync = false;
          if (completedOp) {
            if (completedOp.type === `delete` && previousVisibleValue !== void 0 && newVisibleValue === void 0 && deepEquals(completedOp.value, previousVisibleValue)) {
              isRedundantSync = true;
            } else if (newVisibleValue !== void 0 && deepEquals(completedOp.value, newVisibleValue)) {
              isRedundantSync = true;
            }
          }
          if (!isRedundantSync) {
            if (previousVisibleValue === void 0 && newVisibleValue !== void 0) {
              events.push({
                type: `insert`,
                key,
                value: newVisibleValue
              });
            } else if (previousVisibleValue !== void 0 && newVisibleValue === void 0) {
              events.push({
                type: `delete`,
                key,
                value: previousVisibleValue
              });
            } else if (previousVisibleValue !== void 0 && newVisibleValue !== void 0 && !deepEquals(previousVisibleValue, newVisibleValue)) {
              events.push({
                type: `update`,
                key,
                value: newVisibleValue,
                previousValue: previousVisibleValue
              });
            }
          }
        }
        this.size = this.calculateSize();
        if (events.length > 0) {
          this.indexes.updateIndexes(events);
        }
        this.changes.emitEvents(events, true);
        this.pendingSyncedTransactions = uncommittedSyncedTransactions;
        this.preSyncVisibleState.clear();
        Promise.resolve().then(() => {
          this.recentlySyncedKeys.clear();
        });
        if (!this.hasReceivedFirstCommit) {
          this.hasReceivedFirstCommit = true;
        }
      }
    };
    this.config = config;
    this.transactions = new SortedMap(
      (a, b) => a.compareCreatedAt(b)
    );
    this.syncedData = new SortedMap(config.compare);
  }
  setDeps(deps) {
    this.collection = deps.collection;
    this.lifecycle = deps.lifecycle;
    this.changes = deps.changes;
    this.indexes = deps.indexes;
    this._events = deps.events;
  }
  /**
   * Get the current value for a key (virtual derived state)
   */
  get(key) {
    const { optimisticDeletes, optimisticUpserts, syncedData } = this;
    if (optimisticDeletes.has(key)) {
      return void 0;
    }
    if (optimisticUpserts.has(key)) {
      return optimisticUpserts.get(key);
    }
    return syncedData.get(key);
  }
  /**
   * Check if a key exists in the collection (virtual derived state)
   */
  has(key) {
    const { optimisticDeletes, optimisticUpserts, syncedData } = this;
    if (optimisticDeletes.has(key)) {
      return false;
    }
    if (optimisticUpserts.has(key)) {
      return true;
    }
    return syncedData.has(key);
  }
  /**
   * Get all keys (virtual derived state)
   */
  *keys() {
    const { syncedData, optimisticDeletes, optimisticUpserts } = this;
    for (const key of syncedData.keys()) {
      if (!optimisticDeletes.has(key)) {
        yield key;
      }
    }
    for (const key of optimisticUpserts.keys()) {
      if (!syncedData.has(key) && !optimisticDeletes.has(key)) {
        yield key;
      }
    }
  }
  /**
   * Get all values (virtual derived state)
   */
  *values() {
    for (const key of this.keys()) {
      const value = this.get(key);
      if (value !== void 0) {
        yield value;
      }
    }
  }
  /**
   * Get all entries (virtual derived state)
   */
  *entries() {
    for (const key of this.keys()) {
      const value = this.get(key);
      if (value !== void 0) {
        yield [key, value];
      }
    }
  }
  /**
   * Get all entries (virtual derived state)
   */
  *[Symbol.iterator]() {
    for (const [key, value] of this.entries()) {
      yield [key, value];
    }
  }
  /**
   * Execute a callback for each entry in the collection
   */
  forEach(callbackfn) {
    let index = 0;
    for (const [key, value] of this.entries()) {
      callbackfn(value, key, index++);
    }
  }
  /**
   * Create a new array with the results of calling a function for each entry in the collection
   */
  map(callbackfn) {
    const result = [];
    let index = 0;
    for (const [key, value] of this.entries()) {
      result.push(callbackfn(value, key, index++));
    }
    return result;
  }
  /**
   * Check if the given collection is this collection
   * @param collection The collection to check
   * @returns True if the given collection is this collection, false otherwise
   */
  isThisCollection(collection) {
    return collection === this.collection;
  }
  /**
   * Recompute optimistic state from active transactions
   */
  recomputeOptimisticState(triggeredByUserAction = false) {
    if (this.isCommittingSyncTransactions && !triggeredByUserAction) {
      return;
    }
    const previousState = new Map(this.optimisticUpserts);
    const previousDeletes = new Set(this.optimisticDeletes);
    this.optimisticUpserts.clear();
    this.optimisticDeletes.clear();
    const activeTransactions = [];
    for (const transaction of this.transactions.values()) {
      if (![`completed`, `failed`].includes(transaction.state)) {
        activeTransactions.push(transaction);
      }
    }
    for (const transaction of activeTransactions) {
      for (const mutation of transaction.mutations) {
        if (this.isThisCollection(mutation.collection) && mutation.optimistic) {
          switch (mutation.type) {
            case `insert`:
            case `update`:
              this.optimisticUpserts.set(
                mutation.key,
                mutation.modified
              );
              this.optimisticDeletes.delete(mutation.key);
              break;
            case `delete`:
              this.optimisticUpserts.delete(mutation.key);
              this.optimisticDeletes.add(mutation.key);
              break;
          }
        }
      }
    }
    this.size = this.calculateSize();
    const events = [];
    this.collectOptimisticChanges(previousState, previousDeletes, events);
    const filteredEventsBySyncStatus = events.filter((event) => {
      if (!this.recentlySyncedKeys.has(event.key)) {
        return true;
      }
      if (triggeredByUserAction) {
        return true;
      }
      return false;
    });
    if (this.pendingSyncedTransactions.length > 0 && !triggeredByUserAction) {
      const pendingSyncKeys = /* @__PURE__ */ new Set();
      for (const transaction of this.pendingSyncedTransactions) {
        for (const operation of transaction.operations) {
          pendingSyncKeys.add(operation.key);
        }
      }
      const filteredEvents = filteredEventsBySyncStatus.filter((event) => {
        if (event.type === `delete` && pendingSyncKeys.has(event.key)) {
          const hasActiveOptimisticMutation = activeTransactions.some(
            (tx) => tx.mutations.some(
              (m) => this.isThisCollection(m.collection) && m.key === event.key
            )
          );
          if (!hasActiveOptimisticMutation) {
            return false;
          }
        }
        return true;
      });
      if (filteredEvents.length > 0) {
        this.indexes.updateIndexes(filteredEvents);
      }
      this.changes.emitEvents(filteredEvents, triggeredByUserAction);
    } else {
      if (filteredEventsBySyncStatus.length > 0) {
        this.indexes.updateIndexes(filteredEventsBySyncStatus);
      }
      this.changes.emitEvents(filteredEventsBySyncStatus, triggeredByUserAction);
    }
  }
  /**
   * Calculate the current size based on synced data and optimistic changes
   */
  calculateSize() {
    const syncedSize = this.syncedData.size;
    const deletesFromSynced = Array.from(this.optimisticDeletes).filter(
      (key) => this.syncedData.has(key) && !this.optimisticUpserts.has(key)
    ).length;
    const upsertsNotInSynced = Array.from(this.optimisticUpserts.keys()).filter(
      (key) => !this.syncedData.has(key)
    ).length;
    return syncedSize - deletesFromSynced + upsertsNotInSynced;
  }
  /**
   * Collect events for optimistic changes
   */
  collectOptimisticChanges(previousUpserts, previousDeletes, events) {
    const allKeys = /* @__PURE__ */ new Set([
      ...previousUpserts.keys(),
      ...this.optimisticUpserts.keys(),
      ...previousDeletes,
      ...this.optimisticDeletes
    ]);
    for (const key of allKeys) {
      const currentValue = this.get(key);
      const previousValue = this.getPreviousValue(
        key,
        previousUpserts,
        previousDeletes
      );
      if (previousValue !== void 0 && currentValue === void 0) {
        events.push({ type: `delete`, key, value: previousValue });
      } else if (previousValue === void 0 && currentValue !== void 0) {
        events.push({ type: `insert`, key, value: currentValue });
      } else if (previousValue !== void 0 && currentValue !== void 0 && previousValue !== currentValue) {
        events.push({
          type: `update`,
          key,
          value: currentValue,
          previousValue
        });
      }
    }
  }
  /**
   * Get the previous value for a key given previous optimistic state
   */
  getPreviousValue(key, previousUpserts, previousDeletes) {
    if (previousDeletes.has(key)) {
      return void 0;
    }
    if (previousUpserts.has(key)) {
      return previousUpserts.get(key);
    }
    return this.syncedData.get(key);
  }
  /**
   * Schedule cleanup of a transaction when it completes
   */
  scheduleTransactionCleanup(transaction) {
    if (transaction.state === `completed`) {
      this.transactions.delete(transaction.id);
      return;
    }
    transaction.isPersisted.promise.then(() => {
      this.transactions.delete(transaction.id);
    }).catch(() => {
    });
  }
  /**
   * Capture visible state for keys that will be affected by pending sync operations
   * This must be called BEFORE onTransactionStateChange clears optimistic state
   */
  capturePreSyncVisibleState() {
    if (this.pendingSyncedTransactions.length === 0) return;
    const syncedKeys = /* @__PURE__ */ new Set();
    for (const transaction of this.pendingSyncedTransactions) {
      for (const operation of transaction.operations) {
        syncedKeys.add(operation.key);
      }
    }
    for (const key of syncedKeys) {
      this.recentlySyncedKeys.add(key);
    }
    for (const key of syncedKeys) {
      if (!this.preSyncVisibleState.has(key)) {
        const currentValue = this.get(key);
        if (currentValue !== void 0) {
          this.preSyncVisibleState.set(key, currentValue);
        }
      }
    }
  }
  /**
   * Trigger a recomputation when transactions change
   * This method should be called by the Transaction class when state changes
   */
  onTransactionStateChange() {
    this.changes.shouldBatchEvents = this.pendingSyncedTransactions.length > 0;
    this.capturePreSyncVisibleState();
    this.recomputeOptimisticState(false);
  }
  /**
   * Clean up the collection by stopping sync and clearing data
   * This can be called manually or automatically by garbage collection
   */
  cleanup() {
    this.syncedData.clear();
    this.syncedMetadata.clear();
    this.optimisticUpserts.clear();
    this.optimisticDeletes.clear();
    this.size = 0;
    this.pendingSyncedTransactions = [];
    this.syncedKeys.clear();
    this.hasReceivedFirstCommit = false;
  }
}
class EventEmitter {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map();
  }
  /**
   * Subscribe to an event
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, /* @__PURE__ */ new Set());
    }
    this.listeners.get(event).add(callback);
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
  /**
   * Subscribe to an event once (automatically unsubscribes after first emission)
   * @param event - Event name to listen for
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (eventPayload) => {
      callback(eventPayload);
      unsubscribe();
    });
    return unsubscribe;
  }
  /**
   * Unsubscribe from an event
   * @param event - Event name to stop listening for
   * @param callback - Function to remove
   */
  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }
  /**
   * Wait for an event to be emitted
   * @param event - Event name to wait for
   * @param timeout - Optional timeout in milliseconds
   * @returns Promise that resolves with the event payload
   */
  waitFor(event, timeout) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const unsubscribe = this.on(event, (eventPayload) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = void 0;
        }
        resolve(eventPayload);
        unsubscribe();
      });
      if (timeout) {
        timeoutId = setTimeout(() => {
          timeoutId = void 0;
          unsubscribe();
          reject(new Error(`Timeout waiting for event ${String(event)}`));
        }, timeout);
      }
    });
  }
  /**
   * Emit an event to all listeners
   * @param event - Event name to emit
   * @param eventPayload - Event payload
   * @internal For use by subclasses - subclasses should wrap this with a public emit if needed
   */
  emitInner(event, eventPayload) {
    this.listeners.get(event)?.forEach((listener) => {
      try {
        listener(eventPayload);
      } catch (error) {
        queueMicrotask(() => {
          throw error;
        });
      }
    });
  }
  /**
   * Clear all listeners
   */
  clearListeners() {
    this.listeners.clear();
  }
}
function buildCursor(orderBy, values) {
  if (values.length === 0 || orderBy.length === 0) {
    return void 0;
  }
  if (orderBy.length === 1) {
    const { expression, compareOptions } = orderBy[0];
    const operator = compareOptions.direction === `asc` ? gt : lt;
    return operator(expression, new Value(values[0]));
  }
  const clauses = [];
  for (let i = 0; i < orderBy.length && i < values.length; i++) {
    const clause = orderBy[i];
    const value = values[i];
    const eqConditions = [];
    for (let j = 0; j < i; j++) {
      const prevClause = orderBy[j];
      const prevValue = values[j];
      eqConditions.push(eq(prevClause.expression, new Value(prevValue)));
    }
    const operator = clause.compareOptions.direction === `asc` ? gt : lt;
    const comparison = operator(clause.expression, new Value(value));
    if (eqConditions.length === 0) {
      clauses.push(comparison);
    } else {
      const allConditions = [...eqConditions, comparison];
      clauses.push(allConditions.reduce((acc, cond) => and(acc, cond)));
    }
  }
  if (clauses.length === 1) {
    return clauses[0];
  }
  return clauses.reduce((acc, clause) => or(acc, clause));
}
class CollectionSubscription extends EventEmitter {
  constructor(collection, callback, options) {
    super();
    this.collection = collection;
    this.callback = callback;
    this.options = options;
    this.loadedInitialState = false;
    this.skipFiltering = false;
    this.snapshotSent = false;
    this.loadedSubsets = [];
    this.sentKeys = /* @__PURE__ */ new Set();
    this.limitedSnapshotRowCount = 0;
    this._status = `ready`;
    this.pendingLoadSubsetPromises = /* @__PURE__ */ new Set();
    this.isBufferingForTruncate = false;
    this.truncateBuffer = [];
    this.pendingTruncateRefetches = /* @__PURE__ */ new Set();
    if (options.onUnsubscribe) {
      this.on(`unsubscribed`, (event) => options.onUnsubscribe(event));
    }
    if (options.whereExpression) {
      ensureIndexForExpression(options.whereExpression, this.collection);
    }
    const callbackWithSentKeysTracking = (changes) => {
      callback(changes);
      this.trackSentKeys(changes);
    };
    this.callback = callbackWithSentKeysTracking;
    this.filteredCallback = options.whereExpression ? createFilteredCallback(this.callback, options) : this.callback;
    this.truncateCleanup = this.collection.on(`truncate`, () => {
      this.handleTruncate();
    });
  }
  get status() {
    return this._status;
  }
  /**
   * Handle collection truncate event by resetting state and re-requesting subsets.
   * This is called when the sync layer receives a must-refetch and clears all data.
   *
   * To prevent a flash of missing content, we buffer all changes (deletes from truncate
   * and inserts from refetch) until all loadSubset promises resolve, then emit them together.
   */
  handleTruncate() {
    const subsetsToReload = [...this.loadedSubsets];
    const hasLoadSubsetHandler = this.collection._sync.syncLoadSubsetFn !== null;
    if (subsetsToReload.length === 0 || !hasLoadSubsetHandler) {
      this.snapshotSent = false;
      this.loadedInitialState = false;
      this.limitedSnapshotRowCount = 0;
      this.lastSentKey = void 0;
      this.loadedSubsets = [];
      return;
    }
    this.isBufferingForTruncate = true;
    this.truncateBuffer = [];
    this.pendingTruncateRefetches.clear();
    this.snapshotSent = false;
    this.loadedInitialState = false;
    this.limitedSnapshotRowCount = 0;
    this.lastSentKey = void 0;
    this.loadedSubsets = [];
    queueMicrotask(() => {
      if (!this.isBufferingForTruncate) {
        return;
      }
      for (const options of subsetsToReload) {
        const syncResult = this.collection._sync.loadSubset(options);
        this.loadedSubsets.push(options);
        this.trackLoadSubsetPromise(syncResult);
        if (syncResult instanceof Promise) {
          this.pendingTruncateRefetches.add(syncResult);
          syncResult.catch(() => {
          }).finally(() => {
            this.pendingTruncateRefetches.delete(syncResult);
            this.checkTruncateRefetchComplete();
          });
        }
      }
      if (this.pendingTruncateRefetches.size === 0) {
        this.flushTruncateBuffer();
      }
    });
  }
  /**
   * Check if all truncate refetch promises have completed and flush buffer if so
   */
  checkTruncateRefetchComplete() {
    if (this.pendingTruncateRefetches.size === 0 && this.isBufferingForTruncate) {
      this.flushTruncateBuffer();
    }
  }
  /**
   * Flush the truncate buffer, emitting all buffered changes to the callback
   */
  flushTruncateBuffer() {
    this.isBufferingForTruncate = false;
    const merged = this.truncateBuffer.flat();
    if (merged.length > 0) {
      this.filteredCallback(merged);
    }
    this.truncateBuffer = [];
  }
  setOrderByIndex(index) {
    this.orderByIndex = index;
  }
  /**
   * Set subscription status and emit events if changed
   */
  setStatus(newStatus) {
    if (this._status === newStatus) {
      return;
    }
    const previousStatus = this._status;
    this._status = newStatus;
    this.emitInner(`status:change`, {
      type: `status:change`,
      subscription: this,
      previousStatus,
      status: newStatus
    });
    const eventKey = `status:${newStatus}`;
    this.emitInner(eventKey, {
      type: eventKey,
      subscription: this,
      previousStatus,
      status: newStatus
    });
  }
  /**
   * Track a loadSubset promise and manage loading status
   */
  trackLoadSubsetPromise(syncResult) {
    if (syncResult instanceof Promise) {
      this.pendingLoadSubsetPromises.add(syncResult);
      this.setStatus(`loadingSubset`);
      syncResult.finally(() => {
        this.pendingLoadSubsetPromises.delete(syncResult);
        if (this.pendingLoadSubsetPromises.size === 0) {
          this.setStatus(`ready`);
        }
      });
    }
  }
  hasLoadedInitialState() {
    return this.loadedInitialState;
  }
  hasSentAtLeastOneSnapshot() {
    return this.snapshotSent;
  }
  emitEvents(changes) {
    const newChanges = this.filterAndFlipChanges(changes);
    if (this.isBufferingForTruncate) {
      if (newChanges.length > 0) {
        this.truncateBuffer.push(newChanges);
      }
    } else {
      this.filteredCallback(newChanges);
    }
  }
  /**
   * Sends the snapshot to the callback.
   * Returns a boolean indicating if it succeeded.
   * It can only fail if there is no index to fulfill the request
   * and the optimizedOnly option is set to true,
   * or, the entire state was already loaded.
   */
  requestSnapshot(opts) {
    if (this.loadedInitialState) {
      return false;
    }
    const stateOpts = {
      where: this.options.whereExpression,
      optimizedOnly: opts?.optimizedOnly ?? false
    };
    if (opts) {
      if (`where` in opts) {
        const snapshotWhereExp = opts.where;
        if (stateOpts.where) {
          const subWhereExp = stateOpts.where;
          const combinedWhereExp = and(subWhereExp, snapshotWhereExp);
          stateOpts.where = combinedWhereExp;
        } else {
          stateOpts.where = snapshotWhereExp;
        }
      }
    } else {
      this.loadedInitialState = true;
    }
    const loadOptions = {
      where: stateOpts.where,
      subscription: this,
      // Include orderBy and limit if provided so sync layer can optimize the query
      orderBy: opts?.orderBy,
      limit: opts?.limit
    };
    const syncResult = this.collection._sync.loadSubset(loadOptions);
    opts?.onLoadSubsetResult?.(syncResult);
    this.loadedSubsets.push(loadOptions);
    const trackLoadSubsetPromise = opts?.trackLoadSubsetPromise ?? true;
    if (trackLoadSubsetPromise) {
      this.trackLoadSubsetPromise(syncResult);
    }
    const snapshot = this.collection.currentStateAsChanges(stateOpts);
    if (snapshot === void 0) {
      return false;
    }
    const filteredSnapshot = snapshot.filter(
      (change) => !this.sentKeys.has(change.key)
    );
    for (const change of filteredSnapshot) {
      this.sentKeys.add(change.key);
    }
    this.snapshotSent = true;
    this.callback(filteredSnapshot);
    return true;
  }
  /**
   * Sends a snapshot that fulfills the `where` clause and all rows are bigger or equal to the cursor.
   * Requires a range index to be set with `setOrderByIndex` prior to calling this method.
   * It uses that range index to load the items in the order of the index.
   *
   * For multi-column orderBy:
   * - Uses first value from `minValues` for LOCAL index operations (wide bounds, ensures no missed rows)
   * - Uses all `minValues` to build a precise composite cursor for SYNC layer loadSubset
   *
   * Note 1: it may load more rows than the provided LIMIT because it loads all values equal to the first cursor value + limit values greater.
   *         This is needed to ensure that it does not accidentally skip duplicate values when the limit falls in the middle of some duplicated values.
   * Note 2: it does not send keys that have already been sent before.
   */
  requestLimitedSnapshot({
    orderBy,
    limit,
    minValues,
    offset,
    trackLoadSubsetPromise: shouldTrackLoadSubsetPromise = true,
    onLoadSubsetResult
  }) {
    if (!limit) throw new Error(`limit is required`);
    if (!this.orderByIndex) {
      throw new Error(
        `Ordered snapshot was requested but no index was found. You have to call setOrderByIndex before requesting an ordered snapshot.`
      );
    }
    const hasMinValue = minValues !== void 0 && minValues.length > 0;
    const minValue = minValues?.[0];
    const minValueForIndex = minValue;
    const index = this.orderByIndex;
    const where = this.options.whereExpression;
    const whereFilterFn = where ? createFilterFunctionFromExpression(where) : void 0;
    const filterFn = (key) => {
      if (key !== void 0 && this.sentKeys.has(key)) {
        return false;
      }
      const value = this.collection.get(key);
      if (value === void 0) {
        return false;
      }
      return whereFilterFn?.(value) ?? true;
    };
    let biggestObservedValue = minValueForIndex;
    const changes = [];
    let keys = [];
    if (hasMinValue) {
      const { expression } = orderBy[0];
      const allRowsWithMinValue = this.collection.currentStateAsChanges({
        where: eq(expression, new Value(minValueForIndex))
      });
      if (allRowsWithMinValue) {
        const keysWithMinValue = allRowsWithMinValue.map((change) => change.key).filter((key) => !this.sentKeys.has(key) && filterFn(key));
        keys.push(...keysWithMinValue);
        const keysGreaterThanMin = index.take(
          limit - keys.length,
          minValueForIndex,
          filterFn
        );
        keys.push(...keysGreaterThanMin);
      } else {
        keys = index.take(limit, minValueForIndex, filterFn);
      }
    } else {
      keys = index.takeFromStart(limit, filterFn);
    }
    const valuesNeeded = () => Math.max(limit - changes.length, 0);
    const collectionExhausted = () => keys.length === 0;
    const orderByExpression = orderBy[0].expression;
    const valueExtractor = orderByExpression.type === `ref` ? compileExpression(new PropRef(orderByExpression.path), true) : null;
    while (valuesNeeded() > 0 && !collectionExhausted()) {
      const insertedKeys = /* @__PURE__ */ new Set();
      for (const key of keys) {
        const value = this.collection.get(key);
        changes.push({
          type: `insert`,
          key,
          value
        });
        biggestObservedValue = valueExtractor ? valueExtractor(value) : value;
        insertedKeys.add(key);
      }
      keys = index.take(valuesNeeded(), biggestObservedValue, filterFn);
    }
    const currentOffset = this.limitedSnapshotRowCount;
    for (const change of changes) {
      this.sentKeys.add(change.key);
    }
    this.callback(changes);
    this.limitedSnapshotRowCount += changes.length;
    if (changes.length > 0) {
      this.lastSentKey = changes[changes.length - 1].key;
    }
    let cursorExpressions;
    if (minValues !== void 0 && minValues.length > 0) {
      const whereFromCursor = buildCursor(orderBy, minValues);
      if (whereFromCursor) {
        const { expression } = orderBy[0];
        const cursorMinValue = minValues[0];
        let whereCurrentCursor;
        if (cursorMinValue instanceof Date) {
          const cursorMinValuePlus1ms = new Date(cursorMinValue.getTime() + 1);
          whereCurrentCursor = and(
            gte(expression, new Value(cursorMinValue)),
            lt(expression, new Value(cursorMinValuePlus1ms))
          );
        } else {
          whereCurrentCursor = eq(expression, new Value(cursorMinValue));
        }
        cursorExpressions = {
          whereFrom: whereFromCursor,
          whereCurrent: whereCurrentCursor,
          lastKey: this.lastSentKey
        };
      }
    }
    const loadOptions = {
      where,
      // Main filter only, no cursor
      limit,
      orderBy,
      cursor: cursorExpressions,
      // Cursor expressions passed separately
      offset: offset ?? currentOffset,
      // Use provided offset, or auto-tracked offset
      subscription: this
    };
    const syncResult = this.collection._sync.loadSubset(loadOptions);
    onLoadSubsetResult?.(syncResult);
    this.loadedSubsets.push(loadOptions);
    if (shouldTrackLoadSubsetPromise) {
      this.trackLoadSubsetPromise(syncResult);
    }
  }
  // TODO: also add similar test but that checks that it can also load it from the collection's loadSubset function
  //       and that that also works properly (i.e. does not skip duplicate values)
  /**
   * Filters and flips changes for keys that have not been sent yet.
   * Deletes are filtered out for keys that have not been sent yet.
   * Updates are flipped into inserts for keys that have not been sent yet.
   * Duplicate inserts are filtered out to prevent D2 multiplicity > 1.
   */
  filterAndFlipChanges(changes) {
    if (this.loadedInitialState || this.skipFiltering) {
      return changes;
    }
    const skipDeleteFilter = this.isBufferingForTruncate;
    const newChanges = [];
    for (const change of changes) {
      let newChange = change;
      const keyInSentKeys = this.sentKeys.has(change.key);
      if (!keyInSentKeys) {
        if (change.type === `update`) {
          newChange = { ...change, type: `insert`, previousValue: void 0 };
        } else if (change.type === `delete`) {
          if (!skipDeleteFilter) {
            continue;
          }
        }
        this.sentKeys.add(change.key);
      } else {
        if (change.type === `insert`) {
          continue;
        } else if (change.type === `delete`) {
          this.sentKeys.delete(change.key);
        }
      }
      newChanges.push(newChange);
    }
    return newChanges;
  }
  trackSentKeys(changes) {
    if (this.loadedInitialState || this.skipFiltering) {
      return;
    }
    for (const change of changes) {
      if (change.type === `delete`) {
        this.sentKeys.delete(change.key);
      } else {
        this.sentKeys.add(change.key);
      }
    }
    if (this.orderByIndex) {
      this.limitedSnapshotRowCount = Math.max(
        this.limitedSnapshotRowCount,
        this.sentKeys.size
      );
    }
  }
  /**
   * Mark that the subscription should not filter any changes.
   * This is used when includeInitialState is explicitly set to false,
   * meaning the caller doesn't want initial state but does want ALL future changes.
   */
  markAllStateAsSeen() {
    this.skipFiltering = true;
  }
  unsubscribe() {
    this.truncateCleanup?.();
    this.truncateCleanup = void 0;
    this.isBufferingForTruncate = false;
    this.truncateBuffer = [];
    this.pendingTruncateRefetches.clear();
    for (const options of this.loadedSubsets) {
      this.collection._sync.unloadSubset(options);
    }
    this.loadedSubsets = [];
    this.emitInner(`unsubscribed`, {
      type: `unsubscribed`,
      subscription: this
    });
    this.clearListeners();
  }
}
class CollectionChangesManager {
  /**
   * Creates a new CollectionChangesManager instance
   */
  constructor() {
    this.activeSubscribersCount = 0;
    this.changeSubscriptions = /* @__PURE__ */ new Set();
    this.batchedEvents = [];
    this.shouldBatchEvents = false;
  }
  setDeps(deps) {
    this.lifecycle = deps.lifecycle;
    this.sync = deps.sync;
    this.events = deps.events;
    this.collection = deps.collection;
  }
  /**
   * Emit an empty ready event to notify subscribers that the collection is ready
   * This bypasses the normal empty array check in emitEvents
   */
  emitEmptyReadyEvent() {
    for (const subscription of this.changeSubscriptions) {
      subscription.emitEvents([]);
    }
  }
  /**
   * Emit events either immediately or batch them for later emission
   */
  emitEvents(changes, forceEmit = false) {
    if (this.shouldBatchEvents && !forceEmit) {
      this.batchedEvents.push(...changes);
      return;
    }
    let eventsToEmit = changes;
    if (forceEmit) {
      if (this.batchedEvents.length > 0) {
        eventsToEmit = [...this.batchedEvents, ...changes];
      }
      this.batchedEvents = [];
      this.shouldBatchEvents = false;
    }
    if (eventsToEmit.length === 0) {
      return;
    }
    for (const subscription of this.changeSubscriptions) {
      subscription.emitEvents(eventsToEmit);
    }
  }
  /**
   * Subscribe to changes in the collection
   */
  subscribeChanges(callback, options = {}) {
    this.addSubscriber();
    if (options.where && options.whereExpression) {
      throw new Error(
        `Cannot specify both 'where' and 'whereExpression' options. Use one or the other.`
      );
    }
    const { where, ...opts } = options;
    let whereExpression = opts.whereExpression;
    if (where) {
      const proxy = createSingleRowRefProxy();
      const result = where(proxy);
      whereExpression = toExpression(result);
    }
    const subscription = new CollectionSubscription(this.collection, callback, {
      ...opts,
      whereExpression,
      onUnsubscribe: () => {
        this.removeSubscriber();
        this.changeSubscriptions.delete(subscription);
      }
    });
    if (options.onStatusChange) {
      subscription.on(`status:change`, options.onStatusChange);
    }
    if (options.includeInitialState) {
      subscription.requestSnapshot({
        trackLoadSubsetPromise: false,
        orderBy: options.orderBy,
        limit: options.limit,
        onLoadSubsetResult: options.onLoadSubsetResult
      });
    } else if (options.includeInitialState === false) {
      subscription.markAllStateAsSeen();
    }
    this.changeSubscriptions.add(subscription);
    return subscription;
  }
  /**
   * Increment the active subscribers count and start sync if needed
   */
  addSubscriber() {
    const previousSubscriberCount = this.activeSubscribersCount;
    this.activeSubscribersCount++;
    this.lifecycle.cancelGCTimer();
    if (this.lifecycle.status === `cleaned-up` || this.lifecycle.status === `idle`) {
      this.sync.startSync();
    }
    this.events.emitSubscribersChange(
      this.activeSubscribersCount,
      previousSubscriberCount
    );
  }
  /**
   * Decrement the active subscribers count and start GC timer if needed
   */
  removeSubscriber() {
    const previousSubscriberCount = this.activeSubscribersCount;
    this.activeSubscribersCount--;
    if (this.activeSubscribersCount === 0) {
      this.lifecycle.startGCTimer();
    } else if (this.activeSubscribersCount < 0) {
      throw new NegativeActiveSubscribersError();
    }
    this.events.emitSubscribersChange(
      this.activeSubscribersCount,
      previousSubscriberCount
    );
  }
  /**
   * Clean up the collection by stopping sync and clearing data
   * This can be called manually or automatically by garbage collection
   */
  cleanup() {
    this.batchedEvents = [];
    this.shouldBatchEvents = false;
  }
}
const requestIdleCallbackPolyfill = (callback) => {
  const timeout = 0;
  const timeoutId = setTimeout(() => {
    callback({
      didTimeout: true,
      // Always indicate timeout for the polyfill
      timeRemaining: () => 50
      // Return some time remaining for polyfill
    });
  }, timeout);
  return timeoutId;
};
const cancelIdleCallbackPolyfill = (id) => {
  clearTimeout(id);
};
const safeRequestIdleCallback = typeof window !== `undefined` && `requestIdleCallback` in window ? (callback, options) => window.requestIdleCallback(callback, options) : (callback, _options) => requestIdleCallbackPolyfill(callback);
const safeCancelIdleCallback = typeof window !== `undefined` && `cancelIdleCallback` in window ? (id) => window.cancelIdleCallback(id) : cancelIdleCallbackPolyfill;
class CollectionLifecycleManager {
  /**
   * Creates a new CollectionLifecycleManager instance
   */
  constructor(config, id) {
    this.status = `idle`;
    this.hasBeenReady = false;
    this.hasReceivedFirstCommit = false;
    this.onFirstReadyCallbacks = [];
    this.gcTimeoutId = null;
    this.idleCallbackId = null;
    this.config = config;
    this.id = id;
  }
  setDeps(deps) {
    this.indexes = deps.indexes;
    this.events = deps.events;
    this.changes = deps.changes;
    this.sync = deps.sync;
    this.state = deps.state;
  }
  /**
   * Validates state transitions to prevent invalid status changes
   */
  validateStatusTransition(from, to) {
    if (from === to) {
      return;
    }
    const validTransitions = {
      idle: [`loading`, `error`, `cleaned-up`],
      loading: [`ready`, `error`, `cleaned-up`],
      ready: [`cleaned-up`, `error`],
      error: [`cleaned-up`, `idle`],
      "cleaned-up": [`loading`, `error`]
    };
    if (!validTransitions[from].includes(to)) {
      throw new InvalidCollectionStatusTransitionError(from, to, this.id);
    }
  }
  /**
   * Safely update the collection status with validation
   * @private
   */
  setStatus(newStatus, allowReady = false) {
    if (newStatus === `ready` && !allowReady) {
      throw new CollectionStateError(
        `You can't directly call "setStatus('ready'). You must use markReady instead.`
      );
    }
    this.validateStatusTransition(this.status, newStatus);
    const previousStatus = this.status;
    this.status = newStatus;
    if (newStatus === `ready` && !this.indexes.isIndexesResolved) {
      this.indexes.resolveAllIndexes().catch((error) => {
        console.warn(
          `${this.config.id ? `[${this.config.id}] ` : ``}Failed to resolve indexes:`,
          error
        );
      });
    }
    this.events.emitStatusChange(newStatus, previousStatus);
  }
  /**
   * Validates that the collection is in a usable state for data operations
   * @private
   */
  validateCollectionUsable(operation) {
    switch (this.status) {
      case `error`:
        throw new CollectionInErrorStateError(operation, this.id);
      case `cleaned-up`:
        this.sync.startSync();
        break;
    }
  }
  /**
   * Mark the collection as ready for use
   * This is called by sync implementations to explicitly signal that the collection is ready,
   * providing a more intuitive alternative to using commits for readiness signaling
   * @private - Should only be called by sync implementations
   */
  markReady() {
    this.validateStatusTransition(this.status, `ready`);
    if (this.status === `loading`) {
      this.setStatus(`ready`, true);
      if (!this.hasBeenReady) {
        this.hasBeenReady = true;
        if (!this.hasReceivedFirstCommit) {
          this.hasReceivedFirstCommit = true;
        }
        const callbacks = [...this.onFirstReadyCallbacks];
        this.onFirstReadyCallbacks = [];
        callbacks.forEach((callback) => callback());
      }
      if (this.changes.changeSubscriptions.size > 0) {
        this.changes.emitEmptyReadyEvent();
      }
    }
  }
  /**
   * Start the garbage collection timer
   * Called when the collection becomes inactive (no subscribers)
   */
  startGCTimer() {
    if (this.gcTimeoutId) {
      clearTimeout(this.gcTimeoutId);
    }
    const gcTime = this.config.gcTime ?? 3e5;
    if (gcTime <= 0 || !Number.isFinite(gcTime)) {
      return;
    }
    this.gcTimeoutId = setTimeout(() => {
      if (this.changes.activeSubscribersCount === 0) {
        this.scheduleIdleCleanup();
      }
    }, gcTime);
  }
  /**
   * Cancel the garbage collection timer
   * Called when the collection becomes active again
   */
  cancelGCTimer() {
    if (this.gcTimeoutId) {
      clearTimeout(this.gcTimeoutId);
      this.gcTimeoutId = null;
    }
    if (this.idleCallbackId !== null) {
      safeCancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = null;
    }
  }
  /**
   * Schedule cleanup to run during browser idle time
   * This prevents blocking the UI thread during cleanup operations
   */
  scheduleIdleCleanup() {
    if (this.idleCallbackId !== null) {
      safeCancelIdleCallback(this.idleCallbackId);
    }
    this.idleCallbackId = safeRequestIdleCallback(
      (deadline) => {
        if (this.changes.activeSubscribersCount === 0) {
          const cleanupCompleted = this.performCleanup(deadline);
          if (cleanupCompleted) {
            this.idleCallbackId = null;
          }
        } else {
          this.idleCallbackId = null;
        }
      },
      { timeout: 1e3 }
    );
  }
  /**
   * Perform cleanup operations, optionally in chunks during idle time
   * @returns true if cleanup was completed, false if it was rescheduled
   */
  performCleanup(deadline) {
    const hasTime = !deadline || deadline.timeRemaining() > 0 || deadline.didTimeout;
    if (hasTime) {
      this.sync.cleanup();
      this.state.cleanup();
      this.changes.cleanup();
      this.indexes.cleanup();
      if (this.gcTimeoutId) {
        clearTimeout(this.gcTimeoutId);
        this.gcTimeoutId = null;
      }
      this.hasBeenReady = false;
      const callbacks = [...this.onFirstReadyCallbacks];
      this.onFirstReadyCallbacks = [];
      callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          console.error(
            `${this.config.id ? `[${this.config.id}] ` : ``}Error in onFirstReady callback during cleanup:`,
            error
          );
        }
      });
      this.setStatus(`cleaned-up`);
      this.events.cleanup();
      return true;
    } else {
      this.scheduleIdleCleanup();
      return false;
    }
  }
  /**
   * Register a callback to be executed when the collection first becomes ready
   * Useful for preloading collections
   * @param callback Function to call when the collection first becomes ready
   */
  onFirstReady(callback) {
    if (this.hasBeenReady) {
      callback();
      return;
    }
    this.onFirstReadyCallbacks.push(callback);
  }
  cleanup() {
    if (this.idleCallbackId !== null) {
      safeCancelIdleCallback(this.idleCallbackId);
      this.idleCallbackId = null;
    }
    this.performCleanup();
  }
}
const LIVE_QUERY_INTERNAL = /* @__PURE__ */ Symbol(`liveQueryInternal`);
class CollectionSyncManager {
  /**
   * Creates a new CollectionSyncManager instance
   */
  constructor(config, id) {
    this.preloadPromise = null;
    this.syncCleanupFn = null;
    this.syncLoadSubsetFn = null;
    this.syncUnloadSubsetFn = null;
    this.pendingLoadSubsetPromises = /* @__PURE__ */ new Set();
    this.config = config;
    this.id = id;
    this.syncMode = config.syncMode ?? `eager`;
  }
  setDeps(deps) {
    this.collection = deps.collection;
    this.state = deps.state;
    this.lifecycle = deps.lifecycle;
    this._events = deps.events;
  }
  /**
   * Start the sync process for this collection
   * This is called when the collection is first accessed or preloaded
   */
  startSync() {
    if (this.lifecycle.status !== `idle` && this.lifecycle.status !== `cleaned-up`) {
      return;
    }
    this.lifecycle.setStatus(`loading`);
    try {
      const syncRes = normalizeSyncFnResult(
        this.config.sync.sync({
          collection: this.collection,
          begin: (options) => {
            this.state.pendingSyncedTransactions.push({
              committed: false,
              operations: [],
              deletedKeys: /* @__PURE__ */ new Set(),
              immediate: options?.immediate
            });
          },
          write: (messageWithOptionalKey) => {
            const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
            if (!pendingTransaction) {
              throw new NoPendingSyncTransactionWriteError();
            }
            if (pendingTransaction.committed) {
              throw new SyncTransactionAlreadyCommittedWriteError();
            }
            let key = void 0;
            if (`key` in messageWithOptionalKey) {
              key = messageWithOptionalKey.key;
            } else {
              key = this.config.getKey(messageWithOptionalKey.value);
            }
            let messageType = messageWithOptionalKey.type;
            if (messageWithOptionalKey.type === `insert`) {
              const insertingIntoExistingSynced = this.state.syncedData.has(key);
              const hasPendingDeleteForKey = pendingTransaction.deletedKeys.has(key);
              const isTruncateTransaction = pendingTransaction.truncate === true;
              if (insertingIntoExistingSynced && !hasPendingDeleteForKey && !isTruncateTransaction) {
                const existingValue = this.state.syncedData.get(key);
                const valuesEqual = existingValue !== void 0 && deepEquals(existingValue, messageWithOptionalKey.value);
                if (valuesEqual) {
                  messageType = `update`;
                } else {
                  const utils = this.config.utils;
                  const internal = utils[LIVE_QUERY_INTERNAL];
                  throw new DuplicateKeySyncError(key, this.id, {
                    hasCustomGetKey: internal?.hasCustomGetKey ?? false,
                    hasJoins: internal?.hasJoins ?? false,
                    hasDistinct: internal?.hasDistinct ?? false
                  });
                }
              }
            }
            const message = {
              ...messageWithOptionalKey,
              type: messageType,
              key
            };
            pendingTransaction.operations.push(message);
            if (messageType === `delete`) {
              pendingTransaction.deletedKeys.add(key);
            }
          },
          commit: () => {
            const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
            if (!pendingTransaction) {
              throw new NoPendingSyncTransactionCommitError();
            }
            if (pendingTransaction.committed) {
              throw new SyncTransactionAlreadyCommittedError();
            }
            pendingTransaction.committed = true;
            this.state.commitPendingTransactions();
          },
          markReady: () => {
            this.lifecycle.markReady();
          },
          truncate: () => {
            const pendingTransaction = this.state.pendingSyncedTransactions[this.state.pendingSyncedTransactions.length - 1];
            if (!pendingTransaction) {
              throw new NoPendingSyncTransactionWriteError();
            }
            if (pendingTransaction.committed) {
              throw new SyncTransactionAlreadyCommittedWriteError();
            }
            pendingTransaction.operations = [];
            pendingTransaction.deletedKeys.clear();
            pendingTransaction.truncate = true;
            pendingTransaction.optimisticSnapshot = {
              upserts: new Map(this.state.optimisticUpserts),
              deletes: new Set(this.state.optimisticDeletes)
            };
          }
        })
      );
      this.syncCleanupFn = syncRes?.cleanup ?? null;
      this.syncLoadSubsetFn = syncRes?.loadSubset ?? null;
      this.syncUnloadSubsetFn = syncRes?.unloadSubset ?? null;
      if (this.syncMode === `on-demand` && !this.syncLoadSubsetFn) {
        throw new CollectionConfigurationError(
          `Collection "${this.id}" is configured with syncMode "on-demand" but the sync function did not return a loadSubset handler. Either provide a loadSubset handler or use syncMode "eager".`
        );
      }
    } catch (error) {
      this.lifecycle.setStatus(`error`);
      throw error;
    }
  }
  /**
   * Preload the collection data by starting sync if not already started
   * Multiple concurrent calls will share the same promise
   */
  preload() {
    if (this.preloadPromise) {
      return this.preloadPromise;
    }
    if (this.syncMode === `on-demand`) {
      console.warn(
        `${this.id ? `[${this.id}] ` : ``}Calling .preload() on a collection with syncMode "on-demand" is a no-op. In on-demand mode, data is only loaded when queries request it. Instead, create a live query and call .preload() on that to load the specific data you need. See https://tanstack.com/blog/tanstack-db-0.5-query-driven-sync for more details.`
      );
    }
    this.preloadPromise = new Promise((resolve, reject) => {
      if (this.lifecycle.status === `ready`) {
        resolve();
        return;
      }
      if (this.lifecycle.status === `error`) {
        reject(new CollectionIsInErrorStateError());
        return;
      }
      this.lifecycle.onFirstReady(() => {
        resolve();
      });
      if (this.lifecycle.status === `idle` || this.lifecycle.status === `cleaned-up`) {
        try {
          this.startSync();
        } catch (error) {
          reject(error);
          return;
        }
      }
    });
    return this.preloadPromise;
  }
  /**
   * Gets whether the collection is currently loading more data
   */
  get isLoadingSubset() {
    return this.pendingLoadSubsetPromises.size > 0;
  }
  /**
   * Tracks a load promise for isLoadingSubset state.
   * @internal This is for internal coordination (e.g., live-query glue code), not for general use.
   */
  trackLoadPromise(promise) {
    const loadingStarting = !this.isLoadingSubset;
    this.pendingLoadSubsetPromises.add(promise);
    if (loadingStarting) {
      this._events.emit(`loadingSubset:change`, {
        type: `loadingSubset:change`,
        collection: this.collection,
        isLoadingSubset: true,
        previousIsLoadingSubset: false,
        loadingSubsetTransition: `start`
      });
    }
    promise.finally(() => {
      const loadingEnding = this.pendingLoadSubsetPromises.size === 1 && this.pendingLoadSubsetPromises.has(promise);
      this.pendingLoadSubsetPromises.delete(promise);
      if (loadingEnding) {
        this._events.emit(`loadingSubset:change`, {
          type: `loadingSubset:change`,
          collection: this.collection,
          isLoadingSubset: false,
          previousIsLoadingSubset: true,
          loadingSubsetTransition: `end`
        });
      }
    });
  }
  /**
   * Requests the sync layer to load more data.
   * @param options Options to control what data is being loaded
   * @returns If data loading is asynchronous, this method returns a promise that resolves when the data is loaded.
   *          Returns true if no sync function is configured, if syncMode is 'eager', or if there is no work to do.
   */
  loadSubset(options) {
    if (this.syncMode === `eager`) {
      return true;
    }
    if (this.syncLoadSubsetFn) {
      const result = this.syncLoadSubsetFn(options);
      if (result instanceof Promise) {
        this.trackLoadPromise(result);
        return result;
      }
    }
    return true;
  }
  /**
   * Notifies the sync layer that a subset is no longer needed.
   * @param options Options that identify what data is being unloaded
   */
  unloadSubset(options) {
    if (this.syncUnloadSubsetFn) {
      this.syncUnloadSubsetFn(options);
    }
  }
  cleanup() {
    try {
      if (this.syncCleanupFn) {
        this.syncCleanupFn();
        this.syncCleanupFn = null;
      }
    } catch (error) {
      queueMicrotask(() => {
        if (error instanceof Error) {
          const wrappedError = new SyncCleanupError(this.id, error);
          wrappedError.cause = error;
          wrappedError.stack = error.stack;
          throw wrappedError;
        } else {
          throw new SyncCleanupError(this.id, error);
        }
      });
    }
    this.preloadPromise = null;
  }
}
function normalizeSyncFnResult(result) {
  if (typeof result === `function`) {
    return { cleanup: result };
  }
  if (typeof result === `object`) {
    return result;
  }
  return void 0;
}
function isConstructor(resolver) {
  return typeof resolver === `function` && resolver.prototype !== void 0 && resolver.prototype.constructor === resolver;
}
async function resolveIndexConstructor(resolver) {
  if (isConstructor(resolver)) {
    return resolver;
  } else {
    return await resolver();
  }
}
class LazyIndexWrapper {
  constructor(id, expression, name, resolver, options, collectionEntries) {
    this.id = id;
    this.expression = expression;
    this.name = name;
    this.resolver = resolver;
    this.options = options;
    this.collectionEntries = collectionEntries;
    this.indexPromise = null;
    this.resolvedIndex = null;
    if (isConstructor(this.resolver)) {
      this.resolvedIndex = new this.resolver(
        this.id,
        this.expression,
        this.name,
        this.options
      );
      if (this.collectionEntries) {
        this.resolvedIndex.build(this.collectionEntries);
      }
    }
  }
  /**
   * Resolve the actual index
   */
  async resolve() {
    if (this.resolvedIndex) {
      return this.resolvedIndex;
    }
    if (!this.indexPromise) {
      this.indexPromise = this.createIndex();
    }
    this.resolvedIndex = await this.indexPromise;
    return this.resolvedIndex;
  }
  /**
   * Check if already resolved
   */
  isResolved() {
    return this.resolvedIndex !== null;
  }
  /**
   * Get resolved index (throws if not ready)
   */
  getResolved() {
    if (!this.resolvedIndex) {
      throw new Error(
        `Index ${this.id} has not been resolved yet. Ensure collection is synced.`
      );
    }
    return this.resolvedIndex;
  }
  /**
   * Get the index ID
   */
  getId() {
    return this.id;
  }
  /**
   * Get the index name
   */
  getName() {
    return this.name;
  }
  /**
   * Get the index expression
   */
  getExpression() {
    return this.expression;
  }
  async createIndex() {
    const IndexClass = await resolveIndexConstructor(this.resolver);
    return new IndexClass(this.id, this.expression, this.name, this.options);
  }
}
class IndexProxy {
  constructor(indexId, lazyIndex) {
    this.indexId = indexId;
    this.lazyIndex = lazyIndex;
  }
  /**
   * Get the resolved index (throws if not ready)
   */
  get index() {
    return this.lazyIndex.getResolved();
  }
  /**
   * Check if index is ready
   */
  get isReady() {
    return this.lazyIndex.isResolved();
  }
  /**
   * Wait for index to be ready
   */
  async whenReady() {
    return await this.lazyIndex.resolve();
  }
  /**
   * Get the index ID
   */
  get id() {
    return this.indexId;
  }
  /**
   * Get the index name (throws if not ready)
   */
  get name() {
    if (this.isReady) {
      return this.index.name;
    }
    return this.lazyIndex.getName();
  }
  /**
   * Get the index expression (available immediately)
   */
  get expression() {
    return this.lazyIndex.getExpression();
  }
  /**
   * Check if index supports an operation (throws if not ready)
   */
  supports(operation) {
    return this.index.supports(operation);
  }
  /**
   * Get index statistics (throws if not ready)
   */
  getStats() {
    return this.index.getStats();
  }
  /**
   * Check if index matches a field path (available immediately)
   */
  matchesField(fieldPath) {
    const expr = this.expression;
    return expr.type === `ref` && expr.path.length === fieldPath.length && expr.path.every((part, i) => part === fieldPath[i]);
  }
  /**
   * Get the key count (throws if not ready)
   */
  get keyCount() {
    return this.index.keyCount;
  }
  // Test compatibility properties - delegate to resolved index
  get indexedKeysSet() {
    const resolved = this.index;
    return resolved.indexedKeysSet;
  }
  get orderedEntriesArray() {
    const resolved = this.index;
    return resolved.orderedEntriesArray;
  }
  get valueMapData() {
    const resolved = this.index;
    return resolved.valueMapData;
  }
  // BTreeIndex compatibility methods
  equalityLookup(value) {
    const resolved = this.index;
    return resolved.equalityLookup?.(value) ?? /* @__PURE__ */ new Set();
  }
  rangeQuery(options) {
    const resolved = this.index;
    return resolved.rangeQuery?.(options) ?? /* @__PURE__ */ new Set();
  }
  inArrayLookup(values) {
    const resolved = this.index;
    return resolved.inArrayLookup?.(values) ?? /* @__PURE__ */ new Set();
  }
  // Internal method for the collection to get the lazy wrapper
  _getLazyWrapper() {
    return this.lazyIndex;
  }
}
class CollectionIndexesManager {
  constructor() {
    this.lazyIndexes = /* @__PURE__ */ new Map();
    this.resolvedIndexes = /* @__PURE__ */ new Map();
    this.isIndexesResolved = false;
    this.indexCounter = 0;
  }
  setDeps(deps) {
    this.state = deps.state;
    this.lifecycle = deps.lifecycle;
  }
  /**
   * Creates an index on a collection for faster queries.
   */
  createIndex(indexCallback, config = {}) {
    this.lifecycle.validateCollectionUsable(`createIndex`);
    const indexId = ++this.indexCounter;
    const singleRowRefProxy = createSingleRowRefProxy();
    const indexExpression = indexCallback(singleRowRefProxy);
    const expression = toExpression(indexExpression);
    const resolver = config.indexType ?? BTreeIndex;
    const lazyIndex = new LazyIndexWrapper(
      indexId,
      expression,
      config.name,
      resolver,
      config.options,
      this.state.entries()
    );
    this.lazyIndexes.set(indexId, lazyIndex);
    if (resolver === BTreeIndex) {
      try {
        const resolvedIndex = lazyIndex.getResolved();
        this.resolvedIndexes.set(indexId, resolvedIndex);
      } catch (error) {
        console.warn(`Failed to resolve BTreeIndex:`, error);
      }
    } else if (typeof resolver === `function` && resolver.prototype) {
      try {
        const resolvedIndex = lazyIndex.getResolved();
        this.resolvedIndexes.set(indexId, resolvedIndex);
      } catch {
        this.resolveSingleIndex(indexId, lazyIndex).catch((error) => {
          console.warn(`Failed to resolve single index:`, error);
        });
      }
    } else if (this.isIndexesResolved) {
      this.resolveSingleIndex(indexId, lazyIndex).catch((error) => {
        console.warn(`Failed to resolve single index:`, error);
      });
    }
    return new IndexProxy(indexId, lazyIndex);
  }
  /**
   * Resolve all lazy indexes (called when collection first syncs)
   */
  async resolveAllIndexes() {
    if (this.isIndexesResolved) return;
    const resolutionPromises = Array.from(this.lazyIndexes.entries()).map(
      async ([indexId, lazyIndex]) => {
        const resolvedIndex = await lazyIndex.resolve();
        resolvedIndex.build(this.state.entries());
        this.resolvedIndexes.set(indexId, resolvedIndex);
        return { indexId, resolvedIndex };
      }
    );
    await Promise.all(resolutionPromises);
    this.isIndexesResolved = true;
  }
  /**
   * Resolve a single index immediately
   */
  async resolveSingleIndex(indexId, lazyIndex) {
    const resolvedIndex = await lazyIndex.resolve();
    resolvedIndex.build(this.state.entries());
    this.resolvedIndexes.set(indexId, resolvedIndex);
    return resolvedIndex;
  }
  /**
   * Get resolved indexes for query optimization
   */
  get indexes() {
    return this.resolvedIndexes;
  }
  /**
   * Updates all indexes when the collection changes
   */
  updateIndexes(changes) {
    for (const index of this.resolvedIndexes.values()) {
      for (const change of changes) {
        switch (change.type) {
          case `insert`:
            index.add(change.key, change.value);
            break;
          case `update`:
            if (change.previousValue) {
              index.update(change.key, change.previousValue, change.value);
            } else {
              index.add(change.key, change.value);
            }
            break;
          case `delete`:
            index.remove(change.key, change.value);
            break;
        }
      }
    }
  }
  /**
   * Clean up the collection by stopping sync and clearing data
   * This can be called manually or automatically by garbage collection
   */
  cleanup() {
    this.lazyIndexes.clear();
    this.resolvedIndexes.clear();
  }
}
const CALLBACK_ITERATION_METHODS = /* @__PURE__ */ new Set([
  `find`,
  `findLast`,
  `findIndex`,
  `findLastIndex`,
  `filter`,
  `map`,
  `flatMap`,
  `forEach`,
  `some`,
  `every`,
  `reduce`,
  `reduceRight`
]);
const ARRAY_MODIFYING_METHODS = /* @__PURE__ */ new Set([
  `pop`,
  `push`,
  `shift`,
  `unshift`,
  `splice`,
  `sort`,
  `reverse`,
  `fill`,
  `copyWithin`
]);
const MAP_SET_MODIFYING_METHODS = /* @__PURE__ */ new Set([`set`, `delete`, `clear`, `add`]);
const MAP_SET_ITERATOR_METHODS = /* @__PURE__ */ new Set([
  `entries`,
  `keys`,
  `values`,
  `forEach`
]);
function isProxiableObject(value) {
  return value !== null && typeof value === `object` && !(value instanceof Date) && !(value instanceof RegExp) && !isTemporal(value);
}
function createArrayIterationHandler(methodName, methodFn, changeTracker, memoizedCreateChangeProxy) {
  if (!CALLBACK_ITERATION_METHODS.has(methodName)) {
    return void 0;
  }
  return function(...args) {
    const callback = args[0];
    if (typeof callback !== `function`) {
      return methodFn.apply(changeTracker.copy_, args);
    }
    const getProxiedElement = (element, index) => {
      if (isProxiableObject(element)) {
        const nestedParent = {
          tracker: changeTracker,
          prop: String(index)
        };
        const { proxy: elementProxy } = memoizedCreateChangeProxy(
          element,
          nestedParent
        );
        return elementProxy;
      }
      return element;
    };
    const wrappedCallback = function(element, index, array) {
      const proxiedElement = getProxiedElement(element, index);
      return callback.call(this, proxiedElement, index, array);
    };
    if (methodName === `reduce` || methodName === `reduceRight`) {
      const reduceCallback = function(accumulator, element, index, array) {
        const proxiedElement = getProxiedElement(element, index);
        return callback.call(this, accumulator, proxiedElement, index, array);
      };
      return methodFn.apply(changeTracker.copy_, [
        reduceCallback,
        ...args.slice(1)
      ]);
    }
    const result = methodFn.apply(changeTracker.copy_, [
      wrappedCallback,
      ...args.slice(1)
    ]);
    if ((methodName === `find` || methodName === `findLast`) && result && typeof result === `object`) {
      const foundIndex = changeTracker.copy_.indexOf(result);
      if (foundIndex !== -1) {
        return getProxiedElement(result, foundIndex);
      }
    }
    if (methodName === `filter` && Array.isArray(result)) {
      return result.map((element) => {
        const originalIndex = changeTracker.copy_.indexOf(element);
        if (originalIndex !== -1) {
          return getProxiedElement(element, originalIndex);
        }
        return element;
      });
    }
    return result;
  };
}
function createArrayIteratorHandler(changeTracker, memoizedCreateChangeProxy) {
  return function() {
    const array = changeTracker.copy_;
    let index = 0;
    return {
      next() {
        if (index >= array.length) {
          return { done: true, value: void 0 };
        }
        const element = array[index];
        let proxiedElement = element;
        if (isProxiableObject(element)) {
          const nestedParent = {
            tracker: changeTracker,
            prop: String(index)
          };
          const { proxy: elementProxy } = memoizedCreateChangeProxy(
            element,
            nestedParent
          );
          proxiedElement = elementProxy;
        }
        index++;
        return { done: false, value: proxiedElement };
      },
      [Symbol.iterator]() {
        return this;
      }
    };
  };
}
function createModifyingMethodHandler(methodFn, changeTracker, markChanged) {
  return function(...args) {
    const result = methodFn.apply(changeTracker.copy_, args);
    markChanged(changeTracker);
    return result;
  };
}
function createMapSetIteratorHandler(methodName, prop, methodFn, target, changeTracker, memoizedCreateChangeProxy, markChanged) {
  const isIteratorMethod = MAP_SET_ITERATOR_METHODS.has(methodName) || prop === Symbol.iterator;
  if (!isIteratorMethod) {
    return void 0;
  }
  return function(...args) {
    const result = methodFn.apply(changeTracker.copy_, args);
    if (methodName === `forEach`) {
      const callback = args[0];
      if (typeof callback === `function`) {
        const wrappedCallback = function(value, key, collection) {
          const cbresult = callback.call(this, value, key, collection);
          markChanged(changeTracker);
          return cbresult;
        };
        return methodFn.apply(target, [wrappedCallback, ...args.slice(1)]);
      }
    }
    const isValueIterator = methodName === `entries` || methodName === `values` || methodName === Symbol.iterator.toString() || prop === Symbol.iterator;
    if (isValueIterator) {
      const originalIterator = result;
      const valueToKeyMap = /* @__PURE__ */ new Map();
      if (methodName === `values` && target instanceof Map) {
        for (const [key, mapValue] of changeTracker.copy_.entries()) {
          valueToKeyMap.set(mapValue, key);
        }
      }
      const originalToModifiedMap = /* @__PURE__ */ new Map();
      if (target instanceof Set) {
        for (const setValue of changeTracker.copy_.values()) {
          originalToModifiedMap.set(setValue, setValue);
        }
      }
      return {
        next() {
          const nextResult = originalIterator.next();
          if (!nextResult.done && nextResult.value && typeof nextResult.value === `object`) {
            if (methodName === `entries` && Array.isArray(nextResult.value) && nextResult.value.length === 2) {
              if (nextResult.value[1] && typeof nextResult.value[1] === `object`) {
                const mapKey = nextResult.value[0];
                const mapParent = {
                  tracker: changeTracker,
                  prop: mapKey,
                  updateMap: (newValue) => {
                    if (changeTracker.copy_ instanceof Map) {
                      changeTracker.copy_.set(
                        mapKey,
                        newValue
                      );
                    }
                  }
                };
                const { proxy: valueProxy } = memoizedCreateChangeProxy(
                  nextResult.value[1],
                  mapParent
                );
                nextResult.value[1] = valueProxy;
              }
            } else if (methodName === `values` || methodName === Symbol.iterator.toString() || prop === Symbol.iterator) {
              if (methodName === `values` && target instanceof Map) {
                const mapKey = valueToKeyMap.get(nextResult.value);
                if (mapKey !== void 0) {
                  const mapParent = {
                    tracker: changeTracker,
                    prop: mapKey,
                    updateMap: (newValue) => {
                      if (changeTracker.copy_ instanceof Map) {
                        changeTracker.copy_.set(
                          mapKey,
                          newValue
                        );
                      }
                    }
                  };
                  const { proxy: valueProxy } = memoizedCreateChangeProxy(
                    nextResult.value,
                    mapParent
                  );
                  nextResult.value = valueProxy;
                }
              } else if (target instanceof Set) {
                const setOriginalValue = nextResult.value;
                const setParent = {
                  tracker: changeTracker,
                  prop: setOriginalValue,
                  updateSet: (newValue) => {
                    if (changeTracker.copy_ instanceof Set) {
                      changeTracker.copy_.delete(
                        setOriginalValue
                      );
                      changeTracker.copy_.add(newValue);
                      originalToModifiedMap.set(setOriginalValue, newValue);
                    }
                  }
                };
                const { proxy: valueProxy } = memoizedCreateChangeProxy(
                  nextResult.value,
                  setParent
                );
                nextResult.value = valueProxy;
              } else {
                const tempKey = /* @__PURE__ */ Symbol(`iterator-value`);
                const { proxy: valueProxy } = memoizedCreateChangeProxy(
                  nextResult.value,
                  {
                    tracker: changeTracker,
                    prop: tempKey
                  }
                );
                nextResult.value = valueProxy;
              }
            }
          }
          return nextResult;
        },
        [Symbol.iterator]() {
          return this;
        }
      };
    }
    return result;
  };
}
function debugLog(...args) {
  const isBrowser = typeof window !== `undefined` && typeof localStorage !== `undefined`;
  if (isBrowser && localStorage.getItem(`DEBUG`) === `true`) {
    console.log(`[proxy]`, ...args);
  } else if (
    // true
    !isBrowser && typeof process !== `undefined` && process.env.DEBUG === `true`
  ) {
    console.log(`[proxy]`, ...args);
  }
}
function deepClone(obj, visited = /* @__PURE__ */ new WeakMap()) {
  if (obj === null || obj === void 0) {
    return obj;
  }
  if (typeof obj !== `object`) {
    return obj;
  }
  if (visited.has(obj)) {
    return visited.get(obj);
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags);
  }
  if (Array.isArray(obj)) {
    const arrayClone = [];
    visited.set(obj, arrayClone);
    obj.forEach((item, index) => {
      arrayClone[index] = deepClone(item, visited);
    });
    return arrayClone;
  }
  if (ArrayBuffer.isView(obj) && !(obj instanceof DataView)) {
    const TypedArrayConstructor = Object.getPrototypeOf(obj).constructor;
    const clone2 = new TypedArrayConstructor(
      obj.length
    );
    visited.set(obj, clone2);
    for (let i = 0; i < obj.length; i++) {
      clone2[i] = obj[i];
    }
    return clone2;
  }
  if (obj instanceof Map) {
    const clone2 = /* @__PURE__ */ new Map();
    visited.set(obj, clone2);
    obj.forEach((value, key) => {
      clone2.set(key, deepClone(value, visited));
    });
    return clone2;
  }
  if (obj instanceof Set) {
    const clone2 = /* @__PURE__ */ new Set();
    visited.set(obj, clone2);
    obj.forEach((value) => {
      clone2.add(deepClone(value, visited));
    });
    return clone2;
  }
  if (isTemporal(obj)) {
    return obj;
  }
  const clone = {};
  visited.set(obj, clone);
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(
        obj[key],
        visited
      );
    }
  }
  const symbolProps = Object.getOwnPropertySymbols(obj);
  for (const sym of symbolProps) {
    clone[sym] = deepClone(
      obj[sym],
      visited
    );
  }
  return clone;
}
let count = 0;
function getProxyCount() {
  count += 1;
  return count;
}
function createChangeProxy(target, parent) {
  const changeProxyCache = /* @__PURE__ */ new Map();
  function memoizedCreateChangeProxy(innerTarget, innerParent) {
    debugLog(`Object ID:`, innerTarget.constructor.name);
    if (changeProxyCache.has(innerTarget)) {
      return changeProxyCache.get(innerTarget);
    } else {
      const changeProxy = createChangeProxy(innerTarget, innerParent);
      changeProxyCache.set(innerTarget, changeProxy);
      return changeProxy;
    }
  }
  const proxyCache = /* @__PURE__ */ new Map();
  const changeTracker = {
    copy_: deepClone(target),
    originalObject: deepClone(target),
    proxyCount: getProxyCount(),
    modified: false,
    assigned_: {},
    parent,
    target
    // Store reference to the target object
  };
  debugLog(
    `createChangeProxy called for target`,
    target,
    changeTracker.proxyCount
  );
  function markChanged(state) {
    if (!state.modified) {
      state.modified = true;
    }
    if (state.parent) {
      debugLog(`propagating change to parent`);
      if (`updateMap` in state.parent) {
        state.parent.updateMap(state.copy_);
      } else if (`updateSet` in state.parent) {
        state.parent.updateSet(state.copy_);
      } else {
        state.parent.tracker.copy_[state.parent.prop] = state.copy_;
        state.parent.tracker.assigned_[state.parent.prop] = true;
      }
      markChanged(state.parent.tracker);
    }
  }
  function checkIfReverted(state) {
    debugLog(
      `checkIfReverted called with assigned keys:`,
      Object.keys(state.assigned_)
    );
    if (Object.keys(state.assigned_).length === 0 && Object.getOwnPropertySymbols(state.assigned_).length === 0) {
      debugLog(`No assigned properties, returning true`);
      return true;
    }
    for (const prop in state.assigned_) {
      if (state.assigned_[prop] === true) {
        const currentValue = state.copy_[prop];
        const originalValue = state.originalObject[prop];
        debugLog(
          `Checking property ${String(prop)}, current:`,
          currentValue,
          `original:`,
          originalValue
        );
        if (!deepEquals(currentValue, originalValue)) {
          debugLog(`Property ${String(prop)} is different, returning false`);
          return false;
        }
      } else if (state.assigned_[prop] === false) {
        debugLog(`Property ${String(prop)} was deleted, returning false`);
        return false;
      }
    }
    const symbolProps = Object.getOwnPropertySymbols(state.assigned_);
    for (const sym of symbolProps) {
      if (state.assigned_[sym] === true) {
        const currentValue = state.copy_[sym];
        const originalValue = state.originalObject[sym];
        if (!deepEquals(currentValue, originalValue)) {
          debugLog(`Symbol property is different, returning false`);
          return false;
        }
      } else if (state.assigned_[sym] === false) {
        debugLog(`Symbol property was deleted, returning false`);
        return false;
      }
    }
    debugLog(`All properties match original values, returning true`);
    return true;
  }
  function checkParentStatus(parentState, childProp) {
    debugLog(`checkParentStatus called for child prop:`, childProp);
    const isReverted = checkIfReverted(parentState);
    debugLog(`Parent checkIfReverted returned:`, isReverted);
    if (isReverted) {
      debugLog(`Parent is fully reverted, clearing tracking`);
      parentState.modified = false;
      parentState.assigned_ = {};
      if (parentState.parent) {
        debugLog(`Continuing up the parent chain`);
        checkParentStatus(parentState.parent.tracker, parentState.parent.prop);
      }
    }
  }
  function createObjectProxy(obj) {
    debugLog(`createObjectProxy`, obj);
    if (proxyCache.has(obj)) {
      debugLog(`proxyCache found match`);
      return proxyCache.get(obj);
    }
    const proxy2 = new Proxy(obj, {
      get(ptarget, prop) {
        debugLog(`get`, ptarget, prop);
        const value = changeTracker.copy_[prop] ?? changeTracker.originalObject[prop];
        const originalValue = changeTracker.originalObject[prop];
        debugLog(`value (at top of proxy get)`, value);
        const desc = Object.getOwnPropertyDescriptor(ptarget, prop);
        if (desc?.get) {
          return value;
        }
        if (typeof value === `function`) {
          if (Array.isArray(ptarget)) {
            const methodName = prop.toString();
            if (ARRAY_MODIFYING_METHODS.has(methodName)) {
              return createModifyingMethodHandler(
                value,
                changeTracker,
                markChanged
              );
            }
            const iterationHandler = createArrayIterationHandler(
              methodName,
              value,
              changeTracker,
              memoizedCreateChangeProxy
            );
            if (iterationHandler) {
              return iterationHandler;
            }
            if (prop === Symbol.iterator) {
              return createArrayIteratorHandler(
                changeTracker,
                memoizedCreateChangeProxy
              );
            }
          }
          if (ptarget instanceof Map || ptarget instanceof Set) {
            const methodName = prop.toString();
            if (MAP_SET_MODIFYING_METHODS.has(methodName)) {
              return createModifyingMethodHandler(
                value,
                changeTracker,
                markChanged
              );
            }
            const iteratorHandler = createMapSetIteratorHandler(
              methodName,
              prop,
              value,
              ptarget,
              changeTracker,
              memoizedCreateChangeProxy,
              markChanged
            );
            if (iteratorHandler) {
              return iteratorHandler;
            }
          }
          return value.bind(ptarget);
        }
        if (isProxiableObject(value)) {
          const nestedParent = {
            tracker: changeTracker,
            prop: String(prop)
          };
          const { proxy: nestedProxy } = memoizedCreateChangeProxy(
            originalValue,
            nestedParent
          );
          proxyCache.set(value, nestedProxy);
          return nestedProxy;
        }
        return value;
      },
      set(_sobj, prop, value) {
        const currentValue = changeTracker.copy_[prop];
        debugLog(
          `set called for property ${String(prop)}, current:`,
          currentValue,
          `new:`,
          value
        );
        if (!deepEquals(currentValue, value)) {
          const originalValue = changeTracker.originalObject[prop];
          const isRevertToOriginal = deepEquals(value, originalValue);
          debugLog(
            `value:`,
            value,
            `original:`,
            originalValue,
            `isRevertToOriginal:`,
            isRevertToOriginal
          );
          if (isRevertToOriginal) {
            debugLog(`Reverting property ${String(prop)} to original value`);
            delete changeTracker.assigned_[prop.toString()];
            debugLog(`Updating copy with original value for ${String(prop)}`);
            changeTracker.copy_[prop] = deepClone(originalValue);
            debugLog(`Checking if all properties reverted`);
            const allReverted = checkIfReverted(changeTracker);
            debugLog(`All reverted:`, allReverted);
            if (allReverted) {
              debugLog(`All properties reverted, clearing tracking`);
              changeTracker.modified = false;
              changeTracker.assigned_ = {};
              if (parent) {
                debugLog(`Updating parent for property:`, parent.prop);
                checkParentStatus(parent.tracker, parent.prop);
              }
            } else {
              debugLog(`Some properties still changed, keeping modified flag`);
              changeTracker.modified = true;
            }
          } else {
            debugLog(`Setting new value for property ${String(prop)}`);
            changeTracker.copy_[prop] = value;
            changeTracker.assigned_[prop.toString()] = true;
            debugLog(`Marking object and ancestors as modified`, changeTracker);
            markChanged(changeTracker);
          }
        } else {
          debugLog(`Value unchanged, not tracking`);
        }
        return true;
      },
      defineProperty(ptarget, prop, descriptor) {
        const result = Reflect.defineProperty(ptarget, prop, descriptor);
        if (result && `value` in descriptor) {
          changeTracker.copy_[prop] = deepClone(descriptor.value);
          changeTracker.assigned_[prop.toString()] = true;
          markChanged(changeTracker);
        }
        return result;
      },
      getOwnPropertyDescriptor(ptarget, prop) {
        return Reflect.getOwnPropertyDescriptor(ptarget, prop);
      },
      preventExtensions(ptarget) {
        return Reflect.preventExtensions(ptarget);
      },
      isExtensible(ptarget) {
        return Reflect.isExtensible(ptarget);
      },
      deleteProperty(dobj, prop) {
        debugLog(`deleteProperty`, dobj, prop);
        const stringProp = typeof prop === `symbol` ? prop.toString() : prop;
        if (stringProp in dobj) {
          const hadPropertyInOriginal = stringProp in changeTracker.originalObject;
          const result = Reflect.deleteProperty(dobj, prop);
          if (result) {
            if (!hadPropertyInOriginal) {
              delete changeTracker.assigned_[stringProp];
              if (Object.keys(changeTracker.assigned_).length === 0 && Object.getOwnPropertySymbols(changeTracker.assigned_).length === 0) {
                changeTracker.modified = false;
              } else {
                changeTracker.modified = true;
              }
            } else {
              changeTracker.assigned_[stringProp] = false;
              markChanged(changeTracker);
            }
          }
          return result;
        }
        return true;
      }
    });
    proxyCache.set(obj, proxy2);
    return proxy2;
  }
  const proxy = createObjectProxy(changeTracker.copy_);
  return {
    proxy,
    getChanges: () => {
      debugLog(`getChanges called, modified:`, changeTracker.modified);
      debugLog(changeTracker);
      if (!changeTracker.modified) {
        debugLog(`Object not modified, returning empty object`);
        return {};
      }
      if (typeof changeTracker.copy_ !== `object` || Array.isArray(changeTracker.copy_)) {
        return changeTracker.copy_;
      }
      if (Object.keys(changeTracker.assigned_).length === 0) {
        return changeTracker.copy_;
      }
      const result = {};
      for (const key in changeTracker.copy_) {
        if (changeTracker.assigned_[key] === true && key in changeTracker.copy_) {
          result[key] = changeTracker.copy_[key];
        }
      }
      debugLog(`Returning copy:`, result);
      return result;
    }
  };
}
function createArrayChangeProxy(targets) {
  const proxiesWithChanges = targets.map((target) => createChangeProxy(target));
  return {
    proxies: proxiesWithChanges.map((p) => p.proxy),
    getChanges: () => proxiesWithChanges.map((p) => p.getChanges())
  };
}
function withChangeTracking(target, callback) {
  const { proxy, getChanges } = createChangeProxy(target);
  callback(proxy);
  return getChanges();
}
function withArrayChangeTracking(targets, callback) {
  const { proxies, getChanges } = createArrayChangeProxy(targets);
  callback(proxies);
  return getChanges();
}
function createDeferred() {
  let resolve;
  let reject;
  let isPending = true;
  const promise = new Promise((res, rej) => {
    resolve = (value) => {
      isPending = false;
      res(value);
    };
    reject = (reason) => {
      isPending = false;
      rej(reason);
    };
  });
  return {
    promise,
    resolve,
    reject,
    isPending: () => isPending
  };
}
function isPendingAwareJob(dep) {
  return typeof dep === `object` && dep !== null && typeof dep.hasPendingGraphRun === `function`;
}
class Scheduler {
  constructor() {
    this.contexts = /* @__PURE__ */ new Map();
    this.clearListeners = /* @__PURE__ */ new Set();
  }
  /**
   * Get or create the state bucket for a context.
   */
  getOrCreateContext(contextId) {
    let context = this.contexts.get(contextId);
    if (!context) {
      context = {
        queue: [],
        jobs: /* @__PURE__ */ new Map(),
        dependencies: /* @__PURE__ */ new Map(),
        completed: /* @__PURE__ */ new Set()
      };
      this.contexts.set(contextId, context);
    }
    return context;
  }
  /**
   * Schedule work. Without a context id, executes immediately.
   * Otherwise queues the job to be flushed once dependencies are satisfied.
   * Scheduling the same jobId again replaces the previous run function.
   */
  schedule({ contextId, jobId, dependencies, run }) {
    if (typeof contextId === `undefined`) {
      run();
      return;
    }
    const context = this.getOrCreateContext(contextId);
    if (!context.jobs.has(jobId)) {
      context.queue.push(jobId);
    }
    context.jobs.set(jobId, run);
    if (dependencies) {
      const depSet = new Set(dependencies);
      depSet.delete(jobId);
      context.dependencies.set(jobId, depSet);
    } else if (!context.dependencies.has(jobId)) {
      context.dependencies.set(jobId, /* @__PURE__ */ new Set());
    }
    context.completed.delete(jobId);
  }
  /**
   * Flush all queued work for a context. Jobs with unmet dependencies are retried.
   * Throws if a pass completes without running any job (dependency cycle).
   */
  flush(contextId) {
    const context = this.contexts.get(contextId);
    if (!context) return;
    const { queue, jobs, dependencies, completed } = context;
    while (queue.length > 0) {
      let ranThisPass = false;
      const jobsThisPass = queue.length;
      for (let i = 0; i < jobsThisPass; i++) {
        const jobId = queue.shift();
        const run = jobs.get(jobId);
        if (!run) {
          dependencies.delete(jobId);
          completed.delete(jobId);
          continue;
        }
        const deps = dependencies.get(jobId);
        let ready = !deps;
        if (deps) {
          ready = true;
          for (const dep of deps) {
            if (dep === jobId) continue;
            const depHasPending = isPendingAwareJob(dep) && dep.hasPendingGraphRun(contextId);
            if (jobs.has(dep) && !completed.has(dep) || !jobs.has(dep) && depHasPending) {
              ready = false;
              break;
            }
          }
        }
        if (ready) {
          jobs.delete(jobId);
          dependencies.delete(jobId);
          run();
          completed.add(jobId);
          ranThisPass = true;
        } else {
          queue.push(jobId);
        }
      }
      if (!ranThisPass) {
        throw new Error(
          `Scheduler detected unresolved dependencies for context ${String(
            contextId
          )}.`
        );
      }
    }
    this.contexts.delete(contextId);
  }
  /**
   * Flush all contexts with pending work. Useful during tear-down.
   */
  flushAll() {
    for (const contextId of Array.from(this.contexts.keys())) {
      this.flush(contextId);
    }
  }
  /** Clear all scheduled jobs for a context. */
  clear(contextId) {
    this.contexts.delete(contextId);
    this.clearListeners.forEach((listener) => listener(contextId));
  }
  /** Register a listener to be notified when a context is cleared. */
  onClear(listener) {
    this.clearListeners.add(listener);
    return () => this.clearListeners.delete(listener);
  }
  /** Check if a context has pending jobs. */
  hasPendingJobs(contextId) {
    const context = this.contexts.get(contextId);
    return !!context && context.jobs.size > 0;
  }
  /** Remove a single job from a context and clean up its dependencies. */
  clearJob(contextId, jobId) {
    const context = this.contexts.get(contextId);
    if (!context) return;
    context.jobs.delete(jobId);
    context.dependencies.delete(jobId);
    context.completed.delete(jobId);
    context.queue = context.queue.filter((id) => id !== jobId);
    if (context.jobs.size === 0) {
      this.contexts.delete(contextId);
    }
  }
}
const transactionScopedScheduler = new Scheduler();
const transactions = [];
let transactionStack = [];
let sequenceNumber = 0;
function mergePendingMutations(existing, incoming) {
  switch (`${existing.type}-${incoming.type}`) {
    case `insert-update`: {
      return {
        ...existing,
        type: `insert`,
        original: {},
        modified: incoming.modified,
        changes: { ...existing.changes, ...incoming.changes },
        // Keep existing keys (key changes not allowed in updates)
        key: existing.key,
        globalKey: existing.globalKey,
        // Merge metadata (last-write-wins)
        metadata: incoming.metadata ?? existing.metadata,
        syncMetadata: { ...existing.syncMetadata, ...incoming.syncMetadata },
        // Update tracking info
        mutationId: incoming.mutationId,
        updatedAt: incoming.updatedAt
      };
    }
    case `insert-delete`:
      return null;
    case `update-delete`:
      return incoming;
    case `update-update`: {
      return {
        ...incoming,
        // Keep original from first update
        original: existing.original,
        // Union the changes from both updates
        changes: { ...existing.changes, ...incoming.changes },
        // Merge metadata
        metadata: incoming.metadata ?? existing.metadata,
        syncMetadata: { ...existing.syncMetadata, ...incoming.syncMetadata }
      };
    }
    case `delete-delete`:
    case `insert-insert`:
      return incoming;
    default: {
      const _exhaustive = `${existing.type}-${incoming.type}`;
      throw new Error(`Unhandled mutation combination: ${_exhaustive}`);
    }
  }
}
function createTransaction(config) {
  const newTransaction = new Transaction(config);
  transactions.push(newTransaction);
  return newTransaction;
}
function getActiveTransaction() {
  if (transactionStack.length > 0) {
    return transactionStack.slice(-1)[0];
  } else {
    return void 0;
  }
}
function registerTransaction(tx) {
  transactionScopedScheduler.clear(tx.id);
  transactionStack.push(tx);
}
function unregisterTransaction(tx) {
  try {
    transactionScopedScheduler.flush(tx.id);
  } finally {
    transactionStack = transactionStack.filter((t) => t.id !== tx.id);
  }
}
function removeFromPendingList(tx) {
  const index = transactions.findIndex((t) => t.id === tx.id);
  if (index !== -1) {
    transactions.splice(index, 1);
  }
}
class Transaction {
  constructor(config) {
    if (typeof config.mutationFn === `undefined`) {
      throw new MissingMutationFunctionError();
    }
    this.id = config.id ?? crypto.randomUUID();
    this.mutationFn = config.mutationFn;
    this.state = `pending`;
    this.mutations = [];
    this.isPersisted = createDeferred();
    this.autoCommit = config.autoCommit ?? true;
    this.createdAt = /* @__PURE__ */ new Date();
    this.sequenceNumber = sequenceNumber++;
    this.metadata = config.metadata ?? {};
  }
  setState(newState) {
    this.state = newState;
    if (newState === `completed` || newState === `failed`) {
      removeFromPendingList(this);
    }
  }
  /**
   * Execute collection operations within this transaction
   * @param callback - Function containing collection operations to group together. If the
   * callback returns a Promise, the transaction context will remain active until the promise
   * settles, allowing optimistic writes after `await` boundaries.
   * @returns This transaction for chaining
   * @example
   * // Group multiple operations
   * const tx = createTransaction({ mutationFn: async () => {
   *   // Send to API
   * }})
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Buy milk" })
   *   collection.update("2", draft => { draft.completed = true })
   *   collection.delete("3")
   * })
   *
   * await tx.isPersisted.promise
   *
   * @example
   * // Handle mutate errors
   * try {
   *   tx.mutate(() => {
   *     collection.insert({ id: "invalid" }) // This might throw
   *   })
   * } catch (error) {
   *   console.log('Mutation failed:', error)
   * }
   *
   * @example
   * // Manual commit control
   * const tx = createTransaction({ autoCommit: false, mutationFn: async () => {} })
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Item" })
   * })
   *
   * // Commit later when ready
   * await tx.commit()
   */
  mutate(callback) {
    if (this.state !== `pending`) {
      throw new TransactionNotPendingMutateError();
    }
    registerTransaction(this);
    try {
      callback();
    } finally {
      unregisterTransaction(this);
    }
    if (this.autoCommit) {
      this.commit().catch(() => {
      });
    }
    return this;
  }
  /**
   * Apply new mutations to this transaction, intelligently merging with existing mutations
   *
   * When mutations operate on the same item (same globalKey), they are merged according to
   * the following rules:
   *
   * - **insert + update** → insert (merge changes, keep empty original)
   * - **insert + delete** → removed (mutations cancel each other out)
   * - **update + delete** → delete (delete dominates)
   * - **update + update** → update (union changes, keep first original)
   * - **same type** → replace with latest
   *
   * This merging reduces over-the-wire churn and keeps the optimistic local view
   * aligned with user intent.
   *
   * @param mutations - Array of new mutations to apply
   */
  applyMutations(mutations) {
    for (const newMutation of mutations) {
      const existingIndex = this.mutations.findIndex(
        (m) => m.globalKey === newMutation.globalKey
      );
      if (existingIndex >= 0) {
        const existingMutation = this.mutations[existingIndex];
        const mergeResult = mergePendingMutations(existingMutation, newMutation);
        if (mergeResult === null) {
          this.mutations.splice(existingIndex, 1);
        } else {
          this.mutations[existingIndex] = mergeResult;
        }
      } else {
        this.mutations.push(newMutation);
      }
    }
  }
  /**
   * Rollback the transaction and any conflicting transactions
   * @param config - Configuration for rollback behavior
   * @returns This transaction for chaining
   * @example
   * // Manual rollback
   * const tx = createTransaction({ mutationFn: async () => {
   *   // Send to API
   * }})
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Buy milk" })
   * })
   *
   * // Rollback if needed
   * if (shouldCancel) {
   *   tx.rollback()
   * }
   *
   * @example
   * // Handle rollback cascade (automatic)
   * const tx1 = createTransaction({ mutationFn: async () => {} })
   * const tx2 = createTransaction({ mutationFn: async () => {} })
   *
   * tx1.mutate(() => collection.update("1", draft => { draft.value = "A" }))
   * tx2.mutate(() => collection.update("1", draft => { draft.value = "B" })) // Same item
   *
   * tx1.rollback() // This will also rollback tx2 due to conflict
   *
   * @example
   * // Handle rollback in error scenarios
   * try {
   *   await tx.isPersisted.promise
   * } catch (error) {
   *   console.log('Transaction was rolled back:', error)
   *   // Transaction automatically rolled back on mutation function failure
   * }
   */
  rollback(config) {
    const isSecondaryRollback = config?.isSecondaryRollback ?? false;
    if (this.state === `completed`) {
      throw new TransactionAlreadyCompletedRollbackError();
    }
    this.setState(`failed`);
    if (!isSecondaryRollback) {
      const mutationIds = /* @__PURE__ */ new Set();
      this.mutations.forEach((m) => mutationIds.add(m.globalKey));
      for (const t of transactions) {
        t.state === `pending` && t.mutations.some((m) => mutationIds.has(m.globalKey)) && t.rollback({ isSecondaryRollback: true });
      }
    }
    this.isPersisted.reject(this.error?.error);
    this.touchCollection();
    return this;
  }
  // Tell collection that something has changed with the transaction
  touchCollection() {
    const hasCalled = /* @__PURE__ */ new Set();
    for (const mutation of this.mutations) {
      if (!hasCalled.has(mutation.collection.id)) {
        mutation.collection._state.onTransactionStateChange();
        if (mutation.collection._state.pendingSyncedTransactions.length > 0) {
          mutation.collection._state.commitPendingTransactions();
        }
        hasCalled.add(mutation.collection.id);
      }
    }
  }
  /**
   * Commit the transaction and execute the mutation function
   * @returns Promise that resolves to this transaction when complete
   * @example
   * // Manual commit (when autoCommit is false)
   * const tx = createTransaction({
   *   autoCommit: false,
   *   mutationFn: async ({ transaction }) => {
   *     await api.saveChanges(transaction.mutations)
   *   }
   * })
   *
   * tx.mutate(() => {
   *   collection.insert({ id: "1", text: "Buy milk" })
   * })
   *
   * await tx.commit() // Manually commit
   *
   * @example
   * // Handle commit errors
   * try {
   *   const tx = createTransaction({
   *     mutationFn: async () => { throw new Error("API failed") }
   *   })
   *
   *   tx.mutate(() => {
   *     collection.insert({ id: "1", text: "Item" })
   *   })
   *
   *   await tx.commit()
   * } catch (error) {
   *   console.log('Commit failed, transaction rolled back:', error)
   * }
   *
   * @example
   * // Check transaction state after commit
   * await tx.commit()
   * console.log(tx.state) // "completed" or "failed"
   */
  async commit() {
    if (this.state !== `pending`) {
      throw new TransactionNotPendingCommitError();
    }
    this.setState(`persisting`);
    if (this.mutations.length === 0) {
      this.setState(`completed`);
      this.isPersisted.resolve(this);
      return this;
    }
    try {
      await this.mutationFn({
        transaction: this
      });
      this.setState(`completed`);
      this.touchCollection();
      this.isPersisted.resolve(this);
    } catch (error) {
      const originalError = error instanceof Error ? error : new Error(String(error));
      this.error = {
        message: originalError.message,
        error: originalError
      };
      this.rollback();
      throw originalError;
    }
    return this;
  }
  /**
   * Compare two transactions by their createdAt time and sequence number in order
   * to sort them in the order they were created.
   * @param other - The other transaction to compare to
   * @returns -1 if this transaction was created before the other, 1 if it was created after, 0 if they were created at the same time
   */
  compareCreatedAt(other) {
    const createdAtComparison = this.createdAt.getTime() - other.createdAt.getTime();
    if (createdAtComparison !== 0) {
      return createdAtComparison;
    }
    return this.sequenceNumber - other.sequenceNumber;
  }
}
class CollectionMutationsManager {
  constructor(config, id) {
    this.insert = (data, config2) => {
      this.lifecycle.validateCollectionUsable(`insert`);
      const state = this.state;
      const ambientTransaction = getActiveTransaction();
      if (!ambientTransaction && !this.config.onInsert) {
        throw new MissingInsertHandlerError();
      }
      const items = Array.isArray(data) ? data : [data];
      const mutations = [];
      const keysInCurrentBatch = /* @__PURE__ */ new Set();
      items.forEach((item) => {
        const validatedData = this.validateData(item, `insert`);
        const key = this.config.getKey(validatedData);
        if (this.state.has(key) || keysInCurrentBatch.has(key)) {
          throw new DuplicateKeyError(key);
        }
        keysInCurrentBatch.add(key);
        const globalKey = this.generateGlobalKey(key, item);
        const mutation = {
          mutationId: crypto.randomUUID(),
          original: {},
          modified: validatedData,
          // Pick the values from validatedData based on what's passed in - this is for cases
          // where a schema has default values. The validated data has the extra default
          // values but for changes, we just want to show the data that was actually passed in.
          changes: Object.fromEntries(
            Object.keys(item).map((k) => [
              k,
              validatedData[k]
            ])
          ),
          globalKey,
          key,
          metadata: config2?.metadata,
          syncMetadata: this.config.sync.getSyncMetadata?.() || {},
          optimistic: config2?.optimistic ?? true,
          type: `insert`,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          collection: this.collection
        };
        mutations.push(mutation);
      });
      if (ambientTransaction) {
        ambientTransaction.applyMutations(mutations);
        state.transactions.set(ambientTransaction.id, ambientTransaction);
        state.scheduleTransactionCleanup(ambientTransaction);
        state.recomputeOptimisticState(true);
        return ambientTransaction;
      } else {
        const directOpTransaction = createTransaction({
          mutationFn: async (params) => {
            return await this.config.onInsert({
              transaction: params.transaction,
              collection: this.collection
            });
          }
        });
        directOpTransaction.applyMutations(mutations);
        directOpTransaction.commit().catch(() => void 0);
        state.transactions.set(directOpTransaction.id, directOpTransaction);
        state.scheduleTransactionCleanup(directOpTransaction);
        state.recomputeOptimisticState(true);
        return directOpTransaction;
      }
    };
    this.delete = (keys, config2) => {
      const state = this.state;
      this.lifecycle.validateCollectionUsable(`delete`);
      const ambientTransaction = getActiveTransaction();
      if (!ambientTransaction && !this.config.onDelete) {
        throw new MissingDeleteHandlerError();
      }
      if (Array.isArray(keys) && keys.length === 0) {
        throw new NoKeysPassedToDeleteError();
      }
      const keysArray = Array.isArray(keys) ? keys : [keys];
      const mutations = [];
      for (const key of keysArray) {
        if (!this.state.has(key)) {
          throw new DeleteKeyNotFoundError(key);
        }
        const globalKey = this.generateGlobalKey(key, this.state.get(key));
        const mutation = {
          mutationId: crypto.randomUUID(),
          original: this.state.get(key),
          modified: this.state.get(key),
          changes: this.state.get(key),
          globalKey,
          key,
          metadata: config2?.metadata,
          syncMetadata: state.syncedMetadata.get(key) || {},
          optimistic: config2?.optimistic ?? true,
          type: `delete`,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          collection: this.collection
        };
        mutations.push(mutation);
      }
      if (ambientTransaction) {
        ambientTransaction.applyMutations(mutations);
        state.transactions.set(ambientTransaction.id, ambientTransaction);
        state.scheduleTransactionCleanup(ambientTransaction);
        state.recomputeOptimisticState(true);
        return ambientTransaction;
      }
      const directOpTransaction = createTransaction({
        autoCommit: true,
        mutationFn: async (params) => {
          return this.config.onDelete({
            transaction: params.transaction,
            collection: this.collection
          });
        }
      });
      directOpTransaction.applyMutations(mutations);
      directOpTransaction.commit().catch(() => void 0);
      state.transactions.set(directOpTransaction.id, directOpTransaction);
      state.scheduleTransactionCleanup(directOpTransaction);
      state.recomputeOptimisticState(true);
      return directOpTransaction;
    };
    this.id = id;
    this.config = config;
  }
  setDeps(deps) {
    this.lifecycle = deps.lifecycle;
    this.state = deps.state;
    this.collection = deps.collection;
  }
  ensureStandardSchema(schema) {
    if (schema && `~standard` in schema) {
      return schema;
    }
    throw new InvalidSchemaError();
  }
  validateData(data, type, key) {
    if (!this.config.schema) return data;
    const standardSchema = this.ensureStandardSchema(this.config.schema);
    if (type === `update` && key) {
      const existingData = this.state.get(key);
      if (existingData && data && typeof data === `object` && typeof existingData === `object`) {
        const mergedData = Object.assign({}, existingData, data);
        const result2 = standardSchema[`~standard`].validate(mergedData);
        if (result2 instanceof Promise) {
          throw new SchemaMustBeSynchronousError();
        }
        if (`issues` in result2 && result2.issues) {
          const typedIssues = result2.issues.map((issue) => ({
            message: issue.message,
            path: issue.path?.map((p) => String(p))
          }));
          throw new SchemaValidationError(type, typedIssues);
        }
        const validatedMergedData = result2.value;
        const modifiedKeys = Object.keys(data);
        const extractedChanges = Object.fromEntries(
          modifiedKeys.map((k) => [k, validatedMergedData[k]])
        );
        return extractedChanges;
      }
    }
    const result = standardSchema[`~standard`].validate(data);
    if (result instanceof Promise) {
      throw new SchemaMustBeSynchronousError();
    }
    if (`issues` in result && result.issues) {
      const typedIssues = result.issues.map((issue) => ({
        message: issue.message,
        path: issue.path?.map((p) => String(p))
      }));
      throw new SchemaValidationError(type, typedIssues);
    }
    return result.value;
  }
  generateGlobalKey(key, item) {
    if (typeof key !== `string` && typeof key !== `number`) {
      if (typeof key === `undefined`) {
        throw new UndefinedKeyError(item);
      }
      throw new InvalidKeyError(key, item);
    }
    return `KEY::${this.id}/${key}`;
  }
  /**
   * Updates one or more items in the collection using a callback function
   */
  update(keys, configOrCallback, maybeCallback) {
    if (typeof keys === `undefined`) {
      throw new MissingUpdateArgumentError();
    }
    const state = this.state;
    this.lifecycle.validateCollectionUsable(`update`);
    const ambientTransaction = getActiveTransaction();
    if (!ambientTransaction && !this.config.onUpdate) {
      throw new MissingUpdateHandlerError();
    }
    const isArray = Array.isArray(keys);
    const keysArray = isArray ? keys : [keys];
    if (isArray && keysArray.length === 0) {
      throw new NoKeysPassedToUpdateError();
    }
    const callback = typeof configOrCallback === `function` ? configOrCallback : maybeCallback;
    const config = typeof configOrCallback === `function` ? {} : configOrCallback;
    const currentObjects = keysArray.map((key) => {
      const item = this.state.get(key);
      if (!item) {
        throw new UpdateKeyNotFoundError(key);
      }
      return item;
    });
    let changesArray;
    if (isArray) {
      changesArray = withArrayChangeTracking(
        currentObjects,
        callback
      );
    } else {
      const result = withChangeTracking(
        currentObjects[0],
        callback
      );
      changesArray = [result];
    }
    const mutations = keysArray.map((key, index) => {
      const itemChanges = changesArray[index];
      if (!itemChanges || Object.keys(itemChanges).length === 0) {
        return null;
      }
      const originalItem = currentObjects[index];
      const validatedUpdatePayload = this.validateData(
        itemChanges,
        `update`,
        key
      );
      const modifiedItem = Object.assign(
        {},
        originalItem,
        validatedUpdatePayload
      );
      const originalItemId = this.config.getKey(originalItem);
      const modifiedItemId = this.config.getKey(modifiedItem);
      if (originalItemId !== modifiedItemId) {
        throw new KeyUpdateNotAllowedError(originalItemId, modifiedItemId);
      }
      const globalKey = this.generateGlobalKey(modifiedItemId, modifiedItem);
      return {
        mutationId: crypto.randomUUID(),
        original: originalItem,
        modified: modifiedItem,
        // Pick the values from modifiedItem based on what's passed in - this is for cases
        // where a schema has default values or transforms. The modified data has the extra
        // default or transformed values but for changes, we just want to show the data that
        // was actually passed in.
        changes: Object.fromEntries(
          Object.keys(itemChanges).map((k) => [
            k,
            modifiedItem[k]
          ])
        ),
        globalKey,
        key,
        metadata: config.metadata,
        syncMetadata: state.syncedMetadata.get(key) || {},
        optimistic: config.optimistic ?? true,
        type: `update`,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date(),
        collection: this.collection
      };
    }).filter(Boolean);
    if (mutations.length === 0) {
      const emptyTransaction = createTransaction({
        mutationFn: async () => {
        }
      });
      emptyTransaction.commit().catch(() => void 0);
      state.scheduleTransactionCleanup(emptyTransaction);
      return emptyTransaction;
    }
    if (ambientTransaction) {
      ambientTransaction.applyMutations(mutations);
      state.transactions.set(ambientTransaction.id, ambientTransaction);
      state.scheduleTransactionCleanup(ambientTransaction);
      state.recomputeOptimisticState(true);
      return ambientTransaction;
    }
    const directOpTransaction = createTransaction({
      mutationFn: async (params) => {
        return this.config.onUpdate({
          transaction: params.transaction,
          collection: this.collection
        });
      }
    });
    directOpTransaction.applyMutations(mutations);
    directOpTransaction.commit().catch(() => void 0);
    state.transactions.set(directOpTransaction.id, directOpTransaction);
    state.scheduleTransactionCleanup(directOpTransaction);
    state.recomputeOptimisticState(true);
    return directOpTransaction;
  }
}
class CollectionEventsManager extends EventEmitter {
  constructor() {
    super();
  }
  setDeps(deps) {
    this.collection = deps.collection;
  }
  /**
   * Emit an event to all listeners
   * Public API for emitting collection events
   */
  emit(event, eventPayload) {
    this.emitInner(event, eventPayload);
  }
  emitStatusChange(status, previousStatus) {
    this.emit(`status:change`, {
      type: `status:change`,
      collection: this.collection,
      previousStatus,
      status
    });
    const eventKey = `status:${status}`;
    this.emit(eventKey, {
      type: eventKey,
      collection: this.collection,
      previousStatus,
      status
    });
  }
  emitSubscribersChange(subscriberCount, previousSubscriberCount) {
    this.emit(`subscribers:change`, {
      type: `subscribers:change`,
      collection: this.collection,
      previousSubscriberCount,
      subscriberCount
    });
  }
  cleanup() {
    this.clearListeners();
  }
}
function createCollection(options) {
  const collection = new CollectionImpl(
    options
  );
  if (options.utils) {
    collection.utils = options.utils;
  } else {
    collection.utils = {};
  }
  return collection;
}
class CollectionImpl {
  /**
   * Creates a new Collection instance
   *
   * @param config - Configuration object for the collection
   * @throws Error if sync config is missing
   */
  constructor(config) {
    this.utils = {};
    this.insert = (data, config2) => {
      return this._mutations.insert(data, config2);
    };
    this.delete = (keys, config2) => {
      return this._mutations.delete(keys, config2);
    };
    if (!config) {
      throw new CollectionRequiresConfigError();
    }
    if (!config.sync) {
      throw new CollectionRequiresSyncConfigError();
    }
    if (config.id) {
      this.id = config.id;
    } else {
      this.id = crypto.randomUUID();
    }
    this.config = {
      ...config,
      autoIndex: config.autoIndex ?? `eager`
    };
    this._changes = new CollectionChangesManager();
    this._events = new CollectionEventsManager();
    this._indexes = new CollectionIndexesManager();
    this._lifecycle = new CollectionLifecycleManager(config, this.id);
    this._mutations = new CollectionMutationsManager(config, this.id);
    this._state = new CollectionStateManager(config);
    this._sync = new CollectionSyncManager(config, this.id);
    this.comparisonOpts = buildCompareOptionsFromConfig(config);
    this._changes.setDeps({
      collection: this,
      // Required for passing to CollectionSubscription
      lifecycle: this._lifecycle,
      sync: this._sync,
      events: this._events
    });
    this._events.setDeps({
      collection: this
      // Required for adding to emitted events
    });
    this._indexes.setDeps({
      state: this._state,
      lifecycle: this._lifecycle
    });
    this._lifecycle.setDeps({
      changes: this._changes,
      events: this._events,
      indexes: this._indexes,
      state: this._state,
      sync: this._sync
    });
    this._mutations.setDeps({
      collection: this,
      // Required for passing to config.onInsert/onUpdate/onDelete and annotating mutations
      lifecycle: this._lifecycle,
      state: this._state
    });
    this._state.setDeps({
      collection: this,
      // Required for filtering events to only include this collection
      lifecycle: this._lifecycle,
      changes: this._changes,
      indexes: this._indexes,
      events: this._events
    });
    this._sync.setDeps({
      collection: this,
      // Required for passing to config.sync callback
      state: this._state,
      lifecycle: this._lifecycle,
      events: this._events
    });
    if (config.startSync === true) {
      this._sync.startSync();
    }
  }
  /**
   * Gets the current status of the collection
   */
  get status() {
    return this._lifecycle.status;
  }
  /**
   * Get the number of subscribers to the collection
   */
  get subscriberCount() {
    return this._changes.activeSubscribersCount;
  }
  /**
   * Register a callback to be executed when the collection first becomes ready
   * Useful for preloading collections
   * @param callback Function to call when the collection first becomes ready
   * @example
   * collection.onFirstReady(() => {
   *   console.log('Collection is ready for the first time')
   *   // Safe to access collection.state now
   * })
   */
  onFirstReady(callback) {
    return this._lifecycle.onFirstReady(callback);
  }
  /**
   * Check if the collection is ready for use
   * Returns true if the collection has been marked as ready by its sync implementation
   * @returns true if the collection is ready, false otherwise
   * @example
   * if (collection.isReady()) {
   *   console.log('Collection is ready, data is available')
   *   // Safe to access collection.state
   * } else {
   *   console.log('Collection is still loading')
   * }
   */
  isReady() {
    return this._lifecycle.status === `ready`;
  }
  /**
   * Check if the collection is currently loading more data
   * @returns true if the collection has pending load more operations, false otherwise
   */
  get isLoadingSubset() {
    return this._sync.isLoadingSubset;
  }
  /**
   * Start sync immediately - internal method for compiled queries
   * This bypasses lazy loading for special cases like live query results
   */
  startSyncImmediate() {
    this._sync.startSync();
  }
  /**
   * Preload the collection data by starting sync if not already started
   * Multiple concurrent calls will share the same promise
   */
  preload() {
    return this._sync.preload();
  }
  /**
   * Get the current value for a key (virtual derived state)
   */
  get(key) {
    return this._state.get(key);
  }
  /**
   * Check if a key exists in the collection (virtual derived state)
   */
  has(key) {
    return this._state.has(key);
  }
  /**
   * Get the current size of the collection (cached)
   */
  get size() {
    return this._state.size;
  }
  /**
   * Get all keys (virtual derived state)
   */
  *keys() {
    yield* this._state.keys();
  }
  /**
   * Get all values (virtual derived state)
   */
  *values() {
    yield* this._state.values();
  }
  /**
   * Get all entries (virtual derived state)
   */
  *entries() {
    yield* this._state.entries();
  }
  /**
   * Get all entries (virtual derived state)
   */
  *[Symbol.iterator]() {
    yield* this._state[Symbol.iterator]();
  }
  /**
   * Execute a callback for each entry in the collection
   */
  forEach(callbackfn) {
    return this._state.forEach(callbackfn);
  }
  /**
   * Create a new array with the results of calling a function for each entry in the collection
   */
  map(callbackfn) {
    return this._state.map(callbackfn);
  }
  getKeyFromItem(item) {
    return this.config.getKey(item);
  }
  /**
   * Creates an index on a collection for faster queries.
   * Indexes significantly improve query performance by allowing constant time lookups
   * and logarithmic time range queries instead of full scans.
   *
   * @template TResolver - The type of the index resolver (constructor or async loader)
   * @param indexCallback - Function that extracts the indexed value from each item
   * @param config - Configuration including index type and type-specific options
   * @returns An index proxy that provides access to the index when ready
   *
   * @example
   * // Create a default B+ tree index
   * const ageIndex = collection.createIndex((row) => row.age)
   *
   * // Create a ordered index with custom options
   * const ageIndex = collection.createIndex((row) => row.age, {
   *   indexType: BTreeIndex,
   *   options: {
   *     compareFn: customComparator,
   *     compareOptions: { direction: 'asc', nulls: 'first', stringSort: 'lexical' }
   *   },
   *   name: 'age_btree'
   * })
   *
   * // Create an async-loaded index
   * const textIndex = collection.createIndex((row) => row.content, {
   *   indexType: async () => {
   *     const { FullTextIndex } = await import('./indexes/fulltext.js')
   *     return FullTextIndex
   *   },
   *   options: { language: 'en' }
   * })
   */
  createIndex(indexCallback, config = {}) {
    return this._indexes.createIndex(indexCallback, config);
  }
  /**
   * Get resolved indexes for query optimization
   */
  get indexes() {
    return this._indexes.indexes;
  }
  /**
   * Validates the data against the schema
   */
  validateData(data, type, key) {
    return this._mutations.validateData(data, type, key);
  }
  get compareOptions() {
    return { ...this.comparisonOpts };
  }
  update(keys, configOrCallback, maybeCallback) {
    return this._mutations.update(keys, configOrCallback, maybeCallback);
  }
  /**
   * Gets the current state of the collection as a Map
   * @returns Map containing all items in the collection, with keys as identifiers
   * @example
   * const itemsMap = collection.state
   * console.log(`Collection has ${itemsMap.size} items`)
   *
   * for (const [key, item] of itemsMap) {
   *   console.log(`${key}: ${item.title}`)
   * }
   *
   * // Check if specific item exists
   * if (itemsMap.has("todo-1")) {
   *   console.log("Todo 1 exists:", itemsMap.get("todo-1"))
   * }
   */
  get state() {
    const result = /* @__PURE__ */ new Map();
    for (const [key, value] of this.entries()) {
      result.set(key, value);
    }
    return result;
  }
  /**
   * Gets the current state of the collection as a Map, but only resolves when data is available
   * Waits for the first sync commit to complete before resolving
   *
   * @returns Promise that resolves to a Map containing all items in the collection
   */
  stateWhenReady() {
    if (this.size > 0 || this.isReady()) {
      return Promise.resolve(this.state);
    }
    return this.preload().then(() => this.state);
  }
  /**
   * Gets the current state of the collection as an Array
   *
   * @returns An Array containing all items in the collection
   */
  get toArray() {
    return Array.from(this.values());
  }
  /**
   * Gets the current state of the collection as an Array, but only resolves when data is available
   * Waits for the first sync commit to complete before resolving
   *
   * @returns Promise that resolves to an Array containing all items in the collection
   */
  toArrayWhenReady() {
    if (this.size > 0 || this.isReady()) {
      return Promise.resolve(this.toArray);
    }
    return this.preload().then(() => this.toArray);
  }
  /**
   * Returns the current state of the collection as an array of changes
   * @param options - Options including optional where filter
   * @returns An array of changes
   * @example
   * // Get all items as changes
   * const allChanges = collection.currentStateAsChanges()
   *
   * // Get only items matching a condition
   * const activeChanges = collection.currentStateAsChanges({
   *   where: (row) => row.status === 'active'
   * })
   *
   * // Get only items using a pre-compiled expression
   * const activeChanges = collection.currentStateAsChanges({
   *   whereExpression: eq(row.status, 'active')
   * })
   */
  currentStateAsChanges(options = {}) {
    return currentStateAsChanges(this, options);
  }
  /**
   * Subscribe to changes in the collection
   * @param callback - Function called when items change
   * @param options - Subscription options including includeInitialState and where filter
   * @returns Unsubscribe function - Call this to stop listening for changes
   * @example
   * // Basic subscription
   * const subscription = collection.subscribeChanges((changes) => {
   *   changes.forEach(change => {
   *     console.log(`${change.type}: ${change.key}`, change.value)
   *   })
   * })
   *
   * // Later: subscription.unsubscribe()
   *
   * @example
   * // Include current state immediately
   * const subscription = collection.subscribeChanges((changes) => {
   *   updateUI(changes)
   * }, { includeInitialState: true })
   *
   * @example
   * // Subscribe only to changes matching a condition using where callback
   * import { eq } from "@tanstack/db"
   *
   * const subscription = collection.subscribeChanges((changes) => {
   *   updateUI(changes)
   * }, {
   *   includeInitialState: true,
   *   where: (row) => eq(row.status, "active")
   * })
   *
   * @example
   * // Using multiple conditions with and()
   * import { and, eq, gt } from "@tanstack/db"
   *
   * const subscription = collection.subscribeChanges((changes) => {
   *   updateUI(changes)
   * }, {
   *   where: (row) => and(eq(row.status, "active"), gt(row.priority, 5))
   * })
   */
  subscribeChanges(callback, options = {}) {
    return this._changes.subscribeChanges(callback, options);
  }
  /**
   * Subscribe to a collection event
   */
  on(event, callback) {
    return this._events.on(event, callback);
  }
  /**
   * Subscribe to a collection event once
   */
  once(event, callback) {
    return this._events.once(event, callback);
  }
  /**
   * Unsubscribe from a collection event
   */
  off(event, callback) {
    this._events.off(event, callback);
  }
  /**
   * Wait for a collection event
   */
  waitFor(event, timeout) {
    return this._events.waitFor(event, timeout);
  }
  /**
   * Clean up the collection by stopping sync and clearing data
   * This can be called manually or automatically by garbage collection
   */
  async cleanup() {
    this._lifecycle.cleanup();
    return Promise.resolve();
  }
}
function buildCompareOptionsFromConfig(config) {
  if (config.defaultStringCollation) {
    const options = config.defaultStringCollation;
    return {
      stringSort: options.stringSort ?? `locale`,
      locale: options.stringSort === `locale` ? options.locale : void 0,
      localeOptions: options.stringSort === `locale` ? options.localeOptions : void 0
    };
  } else {
    return {
      stringSort: `locale`
    };
  }
}
function validateJsonSerializable(parser, value, operation) {
  try {
    parser.stringify(value);
  } catch (error) {
    throw new SerializationError(
      operation,
      error instanceof Error ? error.message : String(error)
    );
  }
}
function generateUuid() {
  return crypto.randomUUID();
}
function encodeStorageKey(key) {
  if (typeof key === `number`) {
    return `n:${key}`;
  }
  return `s:${key}`;
}
function decodeStorageKey(encodedKey) {
  if (encodedKey.startsWith(`n:`)) {
    return Number(encodedKey.slice(2));
  }
  if (encodedKey.startsWith(`s:`)) {
    return encodedKey.slice(2);
  }
  return encodedKey;
}
function createInMemoryStorage() {
  const storage = /* @__PURE__ */ new Map();
  return {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, value);
    },
    removeItem(key) {
      storage.delete(key);
    }
  };
}
function createNoOpStorageEventApi() {
  return {
    addEventListener: () => {
    },
    removeEventListener: () => {
    }
  };
}
function localStorageCollectionOptions(config) {
  if (!config.storageKey) {
    throw new StorageKeyRequiredError();
  }
  const storage = config.storage || (typeof window !== `undefined` ? window.localStorage : null) || createInMemoryStorage();
  const storageEventApi = config.storageEventApi || (typeof window !== `undefined` ? window : null) || createNoOpStorageEventApi();
  const parser = config.parser || JSON;
  const lastKnownData = /* @__PURE__ */ new Map();
  const sync = createLocalStorageSync(
    config.storageKey,
    storage,
    storageEventApi,
    parser,
    config.getKey,
    lastKnownData
  );
  const saveToStorage = (dataMap) => {
    try {
      const objectData = {};
      dataMap.forEach((storedItem, key) => {
        objectData[encodeStorageKey(key)] = storedItem;
      });
      const serialized = parser.stringify(objectData);
      storage.setItem(config.storageKey, serialized);
    } catch (error) {
      console.error(
        `[LocalStorageCollection] Error saving data to storage key "${config.storageKey}":`,
        error
      );
      throw error;
    }
  };
  const clearStorage = () => {
    storage.removeItem(config.storageKey);
  };
  const getStorageSize = () => {
    const data = storage.getItem(config.storageKey);
    return data ? new Blob([data]).size : 0;
  };
  const wrappedOnInsert = async (params) => {
    params.transaction.mutations.forEach((mutation) => {
      validateJsonSerializable(parser, mutation.modified, `insert`);
    });
    let handlerResult = {};
    if (config.onInsert) {
      handlerResult = await config.onInsert(params) ?? {};
    }
    params.transaction.mutations.forEach((mutation) => {
      const storedItem = {
        versionKey: generateUuid(),
        data: mutation.modified
      };
      lastKnownData.set(mutation.key, storedItem);
    });
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const wrappedOnUpdate = async (params) => {
    params.transaction.mutations.forEach((mutation) => {
      validateJsonSerializable(parser, mutation.modified, `update`);
    });
    let handlerResult = {};
    if (config.onUpdate) {
      handlerResult = await config.onUpdate(params) ?? {};
    }
    params.transaction.mutations.forEach((mutation) => {
      const storedItem = {
        versionKey: generateUuid(),
        data: mutation.modified
      };
      lastKnownData.set(mutation.key, storedItem);
    });
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const wrappedOnDelete = async (params) => {
    let handlerResult = {};
    if (config.onDelete) {
      handlerResult = await config.onDelete(params) ?? {};
    }
    params.transaction.mutations.forEach((mutation) => {
      lastKnownData.delete(mutation.key);
    });
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(params.transaction.mutations);
    return handlerResult;
  };
  const {
    storageKey: _storageKey,
    storage: _storage,
    storageEventApi: _storageEventApi,
    onInsert: _onInsert,
    onUpdate: _onUpdate,
    onDelete: _onDelete,
    id,
    ...restConfig
  } = config;
  const collectionId = id ?? `local-collection:${config.storageKey}`;
  const acceptMutations = (transaction) => {
    const collectionMutations = transaction.mutations.filter((m) => {
      if (sync.collection && m.collection === sync.collection) {
        return true;
      }
      return m.collection.id === collectionId;
    });
    if (collectionMutations.length === 0) {
      return;
    }
    for (const mutation of collectionMutations) {
      switch (mutation.type) {
        case `insert`:
        case `update`:
          validateJsonSerializable(parser, mutation.modified, mutation.type);
          break;
        case `delete`:
          validateJsonSerializable(parser, mutation.original, mutation.type);
          break;
      }
    }
    for (const mutation of collectionMutations) {
      switch (mutation.type) {
        case `insert`:
        case `update`: {
          const storedItem = {
            versionKey: generateUuid(),
            data: mutation.modified
          };
          lastKnownData.set(mutation.key, storedItem);
          break;
        }
        case `delete`: {
          lastKnownData.delete(mutation.key);
          break;
        }
      }
    }
    saveToStorage(lastKnownData);
    sync.confirmOperationsSync(collectionMutations);
  };
  return {
    ...restConfig,
    id: collectionId,
    sync,
    onInsert: wrappedOnInsert,
    onUpdate: wrappedOnUpdate,
    onDelete: wrappedOnDelete,
    utils: {
      clearStorage,
      getStorageSize,
      acceptMutations
    }
  };
}
function loadFromStorage(storageKey, storage, parser) {
  try {
    const rawData = storage.getItem(storageKey);
    if (!rawData) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parser.parse(rawData);
    const dataMap = /* @__PURE__ */ new Map();
    if (typeof parsed === `object` && parsed !== null && !Array.isArray(parsed)) {
      Object.entries(parsed).forEach(([encodedKey, value]) => {
        if (value && typeof value === `object` && `versionKey` in value && `data` in value) {
          const storedItem = value;
          const decodedKey = decodeStorageKey(encodedKey);
          dataMap.set(decodedKey, storedItem);
        } else {
          throw new InvalidStorageDataFormatError(storageKey, encodedKey);
        }
      });
    } else {
      throw new InvalidStorageObjectFormatError(storageKey);
    }
    return dataMap;
  } catch (error) {
    console.warn(
      `[LocalStorageCollection] Error loading data from storage key "${storageKey}":`,
      error
    );
    return /* @__PURE__ */ new Map();
  }
}
function createLocalStorageSync(storageKey, storage, storageEventApi, parser, _getKey, lastKnownData) {
  let syncParams = null;
  let collection = null;
  const findChanges = (oldData, newData) => {
    const changes = [];
    oldData.forEach((oldStoredItem, key) => {
      const newStoredItem = newData.get(key);
      if (!newStoredItem) {
        changes.push({ type: `delete`, key, value: oldStoredItem.data });
      } else if (oldStoredItem.versionKey !== newStoredItem.versionKey) {
        changes.push({ type: `update`, key, value: newStoredItem.data });
      }
    });
    newData.forEach((newStoredItem, key) => {
      if (!oldData.has(key)) {
        changes.push({ type: `insert`, key, value: newStoredItem.data });
      }
    });
    return changes;
  };
  const processStorageChanges = () => {
    if (!syncParams) return;
    const { begin, write, commit } = syncParams;
    const newData = loadFromStorage(storageKey, storage, parser);
    const changes = findChanges(lastKnownData, newData);
    if (changes.length > 0) {
      begin();
      changes.forEach(({ type, value }) => {
        if (value) {
          validateJsonSerializable(parser, value, type);
          write({ type, value });
        }
      });
      commit();
      lastKnownData.clear();
      newData.forEach((storedItem, key) => {
        lastKnownData.set(key, storedItem);
      });
    }
  };
  const syncConfig = {
    sync: (params) => {
      const { begin, write, commit, markReady } = params;
      syncParams = params;
      collection = params.collection;
      const initialData = loadFromStorage(storageKey, storage, parser);
      if (initialData.size > 0) {
        begin();
        initialData.forEach((storedItem) => {
          validateJsonSerializable(parser, storedItem.data, `load`);
          write({ type: `insert`, value: storedItem.data });
        });
        commit();
      }
      lastKnownData.clear();
      initialData.forEach((storedItem, key) => {
        lastKnownData.set(key, storedItem);
      });
      markReady();
      const handleStorageEvent = (event) => {
        if (event.key !== storageKey || event.storageArea !== storage) {
          return;
        }
        processStorageChanges();
      };
      storageEventApi.addEventListener(`storage`, handleStorageEvent);
    },
    /**
     * Get sync metadata - returns storage key information
     * @returns Object containing storage key and storage type metadata
     */
    getSyncMetadata: () => ({
      storageKey,
      storageType: storage === (typeof window !== `undefined` ? window.localStorage : null) ? `localStorage` : `custom`
    }),
    // Manual trigger function for local updates
    manualTrigger: processStorageChanges,
    // Collection instance reference
    collection
  };
  const confirmOperationsSync = (mutations) => {
    if (!syncParams) {
      return;
    }
    const { begin, write, commit } = syncParams;
    begin();
    mutations.forEach((mutation) => {
      write({
        type: mutation.type,
        value: mutation.type === `delete` ? mutation.original : mutation.modified
      });
    });
    commit();
  };
  return {
    ...syncConfig,
    confirmOperationsSync
  };
}
function optimizeQuery(query) {
  const sourceWhereClauses = extractSourceWhereClauses(query);
  let optimized = query;
  let previousOptimized;
  let iterations = 0;
  const maxIterations = 10;
  while (iterations < maxIterations && !deepEquals(optimized, previousOptimized)) {
    previousOptimized = optimized;
    optimized = applyRecursiveOptimization(optimized);
    iterations++;
  }
  const cleaned = removeRedundantSubqueries(optimized);
  return {
    optimizedQuery: cleaned,
    sourceWhereClauses
  };
}
function extractSourceWhereClauses(query) {
  const sourceWhereClauses = /* @__PURE__ */ new Map();
  if (!query.where || query.where.length === 0) {
    return sourceWhereClauses;
  }
  const splitWhereClauses = splitAndClauses(query.where);
  const analyzedClauses = splitWhereClauses.map(
    (clause) => analyzeWhereClause(clause)
  );
  const groupedClauses = groupWhereClauses(analyzedClauses);
  const nullableSources = getNullableJoinSources(query);
  for (const [sourceAlias, whereClause] of groupedClauses.singleSource) {
    if (isCollectionReference(query, sourceAlias) && !nullableSources.has(sourceAlias)) {
      sourceWhereClauses.set(sourceAlias, whereClause);
    }
  }
  return sourceWhereClauses;
}
function isCollectionReference(query, sourceAlias) {
  if (query.from.alias === sourceAlias) {
    return query.from.type === `collectionRef`;
  }
  if (query.join) {
    for (const joinClause of query.join) {
      if (joinClause.from.alias === sourceAlias) {
        return joinClause.from.type === `collectionRef`;
      }
    }
  }
  return false;
}
function getNullableJoinSources(query) {
  const nullable = /* @__PURE__ */ new Set();
  if (query.join) {
    const mainAlias = query.from.alias;
    for (const join2 of query.join) {
      const joinedAlias = join2.from.alias;
      if (join2.type === `left` || join2.type === `full`) {
        nullable.add(joinedAlias);
      }
      if (join2.type === `right` || join2.type === `full`) {
        nullable.add(mainAlias);
      }
    }
  }
  return nullable;
}
function applyRecursiveOptimization(query) {
  const subqueriesOptimized = {
    ...query,
    from: query.from.type === `queryRef` ? new QueryRef(
      applyRecursiveOptimization(query.from.query),
      query.from.alias
    ) : query.from,
    join: query.join?.map((joinClause) => ({
      ...joinClause,
      from: joinClause.from.type === `queryRef` ? new QueryRef(
        applyRecursiveOptimization(joinClause.from.query),
        joinClause.from.alias
      ) : joinClause.from
    }))
  };
  return applySingleLevelOptimization(subqueriesOptimized);
}
function applySingleLevelOptimization(query) {
  if (!query.where || query.where.length === 0) {
    return query;
  }
  if (!query.join || query.join.length === 0) {
    if (query.where.length > 1) {
      const splitWhereClauses2 = splitAndClauses(query.where);
      const combinedWhere = combineWithAnd(splitWhereClauses2);
      return {
        ...query,
        where: [combinedWhere]
      };
    }
    return query;
  }
  const nonResidualWhereClauses = query.where.filter(
    (where) => !isResidualWhere(where)
  );
  const splitWhereClauses = splitAndClauses(nonResidualWhereClauses);
  const analyzedClauses = splitWhereClauses.map(
    (clause) => analyzeWhereClause(clause)
  );
  const groupedClauses = groupWhereClauses(analyzedClauses);
  const optimizedQuery = applyOptimizations(query, groupedClauses);
  const residualWhereClauses = query.where.filter(
    (where) => isResidualWhere(where)
  );
  if (residualWhereClauses.length > 0) {
    optimizedQuery.where = [
      ...optimizedQuery.where || [],
      ...residualWhereClauses
    ];
  }
  return optimizedQuery;
}
function removeRedundantSubqueries(query) {
  return {
    ...query,
    from: removeRedundantFromClause(query.from),
    join: query.join?.map((joinClause) => ({
      ...joinClause,
      from: removeRedundantFromClause(joinClause.from)
    }))
  };
}
function removeRedundantFromClause(from) {
  if (from.type === `collectionRef`) {
    return from;
  }
  const processedQuery = removeRedundantSubqueries(from.query);
  if (isRedundantSubquery(processedQuery)) {
    const innerFrom = removeRedundantFromClause(processedQuery.from);
    if (innerFrom.type === `collectionRef`) {
      return new CollectionRef(innerFrom.collection, from.alias);
    } else {
      return new QueryRef(innerFrom.query, from.alias);
    }
  }
  return new QueryRef(processedQuery, from.alias);
}
function isRedundantSubquery(query) {
  return (!query.where || query.where.length === 0) && !query.select && (!query.groupBy || query.groupBy.length === 0) && (!query.having || query.having.length === 0) && (!query.orderBy || query.orderBy.length === 0) && (!query.join || query.join.length === 0) && query.limit === void 0 && query.offset === void 0 && !query.fnSelect && (!query.fnWhere || query.fnWhere.length === 0) && (!query.fnHaving || query.fnHaving.length === 0);
}
function splitAndClauses(whereClauses) {
  const result = [];
  for (const whereClause of whereClauses) {
    const clause = getWhereExpression(whereClause);
    result.push(...splitAndClausesRecursive(clause));
  }
  return result;
}
function splitAndClausesRecursive(clause) {
  if (clause.type === `func` && clause.name === `and`) {
    const result = [];
    for (const arg of clause.args) {
      result.push(...splitAndClausesRecursive(arg));
    }
    return result;
  } else {
    return [clause];
  }
}
function analyzeWhereClause(clause) {
  const touchedSources = /* @__PURE__ */ new Set();
  let hasNamespaceOnlyRef = false;
  function collectSources(expr) {
    switch (expr.type) {
      case `ref`:
        if (expr.path && expr.path.length > 0) {
          const firstElement = expr.path[0];
          if (firstElement) {
            touchedSources.add(firstElement);
            if (expr.path.length === 1) {
              hasNamespaceOnlyRef = true;
            }
          }
        }
        break;
      case `func`:
        if (expr.args) {
          expr.args.forEach(collectSources);
        }
        break;
      case `val`:
        break;
      case `agg`:
        if (expr.args) {
          expr.args.forEach(collectSources);
        }
        break;
    }
  }
  collectSources(clause);
  return {
    expression: clause,
    touchedSources,
    hasNamespaceOnlyRef
  };
}
function groupWhereClauses(analyzedClauses) {
  const singleSource = /* @__PURE__ */ new Map();
  const multiSource = [];
  for (const clause of analyzedClauses) {
    if (clause.touchedSources.size === 1 && !clause.hasNamespaceOnlyRef) {
      const source = Array.from(clause.touchedSources)[0];
      if (!singleSource.has(source)) {
        singleSource.set(source, []);
      }
      singleSource.get(source).push(clause.expression);
    } else if (clause.touchedSources.size > 1 || clause.hasNamespaceOnlyRef) {
      multiSource.push(clause.expression);
    }
  }
  const combinedSingleSource = /* @__PURE__ */ new Map();
  for (const [source, clauses] of singleSource) {
    combinedSingleSource.set(source, combineWithAnd(clauses));
  }
  const combinedMultiSource = multiSource.length > 0 ? combineWithAnd(multiSource) : void 0;
  return {
    singleSource: combinedSingleSource,
    multiSource: combinedMultiSource
  };
}
function applyOptimizations(query, groupedClauses) {
  const actuallyOptimized = /* @__PURE__ */ new Set();
  const nullableSources = getNullableJoinSources(query);
  const pushableSingleSource = /* @__PURE__ */ new Map();
  for (const [source, clause] of groupedClauses.singleSource) {
    if (!nullableSources.has(source)) {
      pushableSingleSource.set(source, clause);
    }
  }
  const optimizedFrom = optimizeFromWithTracking(
    query.from,
    pushableSingleSource,
    actuallyOptimized
  );
  const optimizedJoins = query.join ? query.join.map((joinClause) => ({
    ...joinClause,
    from: optimizeFromWithTracking(
      joinClause.from,
      pushableSingleSource,
      actuallyOptimized
    )
  })) : void 0;
  const remainingWhereClauses = [];
  if (groupedClauses.multiSource) {
    remainingWhereClauses.push(groupedClauses.multiSource);
  }
  const hasOuterJoins = nullableSources.size > 0;
  for (const [source, clause] of groupedClauses.singleSource) {
    if (!actuallyOptimized.has(source)) {
      remainingWhereClauses.push(clause);
    } else if (hasOuterJoins) {
      remainingWhereClauses.push(createResidualWhere(clause));
    }
  }
  const finalWhere = remainingWhereClauses.length > 1 ? [
    combineWithAnd(
      remainingWhereClauses.flatMap(
        (clause) => splitAndClausesRecursive(getWhereExpression(clause))
      )
    )
  ] : remainingWhereClauses;
  const optimizedQuery = {
    // Copy all non-optimized fields as-is
    select: query.select,
    groupBy: query.groupBy ? [...query.groupBy] : void 0,
    having: query.having ? [...query.having] : void 0,
    orderBy: query.orderBy ? [...query.orderBy] : void 0,
    limit: query.limit,
    offset: query.offset,
    distinct: query.distinct,
    fnSelect: query.fnSelect,
    fnWhere: query.fnWhere ? [...query.fnWhere] : void 0,
    fnHaving: query.fnHaving ? [...query.fnHaving] : void 0,
    // Use the optimized FROM and JOIN clauses
    from: optimizedFrom,
    join: optimizedJoins,
    // Include combined WHERE clauses
    where: finalWhere.length > 0 ? finalWhere : []
  };
  return optimizedQuery;
}
function deepCopyQuery(query) {
  return {
    // Recursively copy the FROM clause
    from: query.from.type === `collectionRef` ? new CollectionRef(query.from.collection, query.from.alias) : new QueryRef(deepCopyQuery(query.from.query), query.from.alias),
    // Copy all other fields, creating new arrays where necessary
    select: query.select,
    join: query.join ? query.join.map((joinClause) => ({
      type: joinClause.type,
      left: joinClause.left,
      right: joinClause.right,
      from: joinClause.from.type === `collectionRef` ? new CollectionRef(
        joinClause.from.collection,
        joinClause.from.alias
      ) : new QueryRef(
        deepCopyQuery(joinClause.from.query),
        joinClause.from.alias
      )
    })) : void 0,
    where: query.where ? [...query.where] : void 0,
    groupBy: query.groupBy ? [...query.groupBy] : void 0,
    having: query.having ? [...query.having] : void 0,
    orderBy: query.orderBy ? [...query.orderBy] : void 0,
    limit: query.limit,
    offset: query.offset,
    fnSelect: query.fnSelect,
    fnWhere: query.fnWhere ? [...query.fnWhere] : void 0,
    fnHaving: query.fnHaving ? [...query.fnHaving] : void 0
  };
}
function optimizeFromWithTracking(from, singleSourceClauses, actuallyOptimized) {
  const whereClause = singleSourceClauses.get(from.alias);
  if (!whereClause) {
    if (from.type === `collectionRef`) {
      return new CollectionRef(from.collection, from.alias);
    }
    return new QueryRef(deepCopyQuery(from.query), from.alias);
  }
  if (from.type === `collectionRef`) {
    const subQuery = {
      from: new CollectionRef(from.collection, from.alias),
      where: [whereClause]
    };
    actuallyOptimized.add(from.alias);
    return new QueryRef(subQuery, from.alias);
  }
  if (!isSafeToPushIntoExistingSubquery(from.query, whereClause, from.alias)) {
    return new QueryRef(deepCopyQuery(from.query), from.alias);
  }
  if (referencesAliasWithRemappedSelect(from.query, whereClause, from.alias)) {
    return new QueryRef(deepCopyQuery(from.query), from.alias);
  }
  const existingWhere = from.query.where || [];
  const optimizedSubQuery = {
    ...deepCopyQuery(from.query),
    where: [...existingWhere, whereClause]
  };
  actuallyOptimized.add(from.alias);
  return new QueryRef(optimizedSubQuery, from.alias);
}
function unsafeSelect(query, whereClause, outerAlias) {
  if (!query.select) return false;
  return selectHasAggregates(query.select) || whereReferencesComputedSelectFields(query.select, whereClause, outerAlias);
}
function unsafeGroupBy(query) {
  return query.groupBy && query.groupBy.length > 0;
}
function unsafeHaving(query) {
  return query.having && query.having.length > 0;
}
function unsafeOrderBy(query) {
  return query.orderBy && query.orderBy.length > 0 && (query.limit !== void 0 || query.offset !== void 0);
}
function unsafeFnSelect(query) {
  return query.fnSelect || query.fnWhere && query.fnWhere.length > 0 || query.fnHaving && query.fnHaving.length > 0;
}
function isSafeToPushIntoExistingSubquery(query, whereClause, outerAlias) {
  return !(unsafeSelect(query, whereClause, outerAlias) || unsafeGroupBy(query) || unsafeHaving(query) || unsafeOrderBy(query) || unsafeFnSelect(query));
}
function selectHasAggregates(select) {
  for (const value of Object.values(select)) {
    if (typeof value === `object`) {
      const v = value;
      if (v.type === `agg`) return true;
      if (!(`type` in v)) {
        if (selectHasAggregates(v)) return true;
      }
    }
  }
  return false;
}
function collectRefs(expr) {
  const refs = [];
  if (expr == null || typeof expr !== `object`) return refs;
  switch (expr.type) {
    case `ref`:
      refs.push(expr);
      break;
    case `func`:
    case `agg`:
      for (const arg of expr.args ?? []) {
        refs.push(...collectRefs(arg));
      }
      break;
  }
  return refs;
}
function whereReferencesComputedSelectFields(select, whereClause, outerAlias) {
  const computed = /* @__PURE__ */ new Set();
  for (const [key, value] of Object.entries(select)) {
    if (key.startsWith(`__SPREAD_SENTINEL__`)) continue;
    if (value instanceof PropRef) continue;
    computed.add(key);
  }
  const refs = collectRefs(whereClause);
  for (const ref of refs) {
    const path = ref.path;
    if (!Array.isArray(path) || path.length < 2) continue;
    const alias = path[0];
    const field = path[1];
    if (alias !== outerAlias) continue;
    if (computed.has(field)) return true;
  }
  return false;
}
function referencesAliasWithRemappedSelect(subquery, whereClause, outerAlias) {
  const refs = collectRefs(whereClause);
  if (refs.every((ref) => ref.path[0] !== outerAlias)) {
    return false;
  }
  if (subquery.fnSelect) {
    return true;
  }
  const select = subquery.select;
  if (!select) {
    return false;
  }
  for (const ref of refs) {
    const path = ref.path;
    if (path.length < 2) continue;
    if (path[0] !== outerAlias) continue;
    const projected = select[path[1]];
    if (!projected) continue;
    if (!(projected instanceof PropRef)) {
      return true;
    }
    if (projected.path.length < 2) {
      return true;
    }
    const [innerAlias, innerField] = projected.path;
    if (innerAlias !== outerAlias && innerAlias !== subquery.from.alias) {
      return true;
    }
    if (innerField !== path[1]) {
      return true;
    }
  }
  return false;
}
function combineWithAnd(expressions) {
  if (expressions.length === 0) {
    throw new CannotCombineEmptyExpressionListError();
  }
  if (expressions.length === 1) {
    return expressions[0];
  }
  return new Func(`and`, expressions);
}
function processJoins(pipeline, joinClauses, sources, mainCollectionId, mainSource, allInputs, cache, queryMapping, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, rawQuery, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  let resultPipeline = pipeline;
  for (const joinClause of joinClauses) {
    resultPipeline = processJoin(
      resultPipeline,
      joinClause,
      sources,
      mainCollectionId,
      mainSource,
      allInputs,
      cache,
      queryMapping,
      collections,
      subscriptions,
      callbacks,
      lazySources,
      optimizableOrderByCollections,
      setWindowFn,
      rawQuery,
      onCompileSubquery,
      aliasToCollectionId,
      aliasRemapping,
      sourceWhereClauses
    );
  }
  return resultPipeline;
}
function processJoin(pipeline, joinClause, sources, mainCollectionId, mainSource, allInputs, cache, queryMapping, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, rawQuery, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  const isCollectionRef = joinClause.from.type === `collectionRef`;
  const {
    alias: joinedSource,
    input: joinedInput,
    collectionId: joinedCollectionId
  } = processJoinSource(
    joinClause.from,
    allInputs,
    collections,
    subscriptions,
    callbacks,
    lazySources,
    optimizableOrderByCollections,
    setWindowFn,
    cache,
    queryMapping,
    onCompileSubquery,
    aliasToCollectionId,
    aliasRemapping,
    sourceWhereClauses
  );
  sources[joinedSource] = joinedInput;
  if (isCollectionRef) {
    aliasToCollectionId[joinedSource] = joinedCollectionId;
  }
  const mainCollection = collections[mainCollectionId];
  const joinedCollection = collections[joinedCollectionId];
  if (!mainCollection) {
    throw new JoinCollectionNotFoundError(mainCollectionId);
  }
  if (!joinedCollection) {
    throw new JoinCollectionNotFoundError(joinedCollectionId);
  }
  const { activeSource, lazySource } = getActiveAndLazySources(
    joinClause.type,
    mainCollection,
    joinedCollection
  );
  const availableSources = Object.keys(sources);
  const { mainExpr, joinedExpr } = analyzeJoinExpressions(
    joinClause.left,
    joinClause.right,
    availableSources,
    joinedSource
  );
  const compiledMainExpr = compileExpression(mainExpr);
  const compiledJoinedExpr = compileExpression(joinedExpr);
  let mainPipeline = pipeline.pipe(
    map(([currentKey, namespacedRow]) => {
      const mainKey = normalizeValue(compiledMainExpr(namespacedRow));
      return [mainKey, [currentKey, namespacedRow]];
    })
  );
  let joinedPipeline = joinedInput.pipe(
    map(([currentKey, row]) => {
      const namespacedRow = { [joinedSource]: row };
      const joinedKey = normalizeValue(compiledJoinedExpr(namespacedRow));
      return [joinedKey, [currentKey, namespacedRow]];
    })
  );
  if (![`inner`, `left`, `right`, `full`].includes(joinClause.type)) {
    throw new UnsupportedJoinTypeError(joinClause.type);
  }
  if (activeSource) {
    const lazyFrom = activeSource === `main` ? joinClause.from : rawQuery.from;
    const limitedSubquery = lazyFrom.type === `queryRef` && (lazyFrom.query.limit || lazyFrom.query.offset);
    const hasComputedJoinExpr = mainExpr.type === `func` || joinedExpr.type === `func`;
    if (!limitedSubquery && !hasComputedJoinExpr) {
      const lazyAlias = activeSource === `main` ? joinedSource : mainSource;
      lazySources.add(lazyAlias);
      const activePipeline = activeSource === `main` ? mainPipeline : joinedPipeline;
      const lazySourceJoinExpr = activeSource === `main` ? joinedExpr : mainExpr;
      const followRefResult = followRef(
        rawQuery,
        lazySourceJoinExpr,
        lazySource
      );
      const followRefCollection = followRefResult.collection;
      const fieldName = followRefResult.path[0];
      if (fieldName) {
        ensureIndexForField(
          fieldName,
          followRefResult.path,
          followRefCollection
        );
      }
      const activePipelineWithLoading = activePipeline.pipe(
        tap((data) => {
          const resolvedAlias = aliasRemapping[lazyAlias] || lazyAlias;
          const lazySourceSubscription = subscriptions[resolvedAlias];
          if (!lazySourceSubscription) {
            throw new SubscriptionNotFoundError(
              resolvedAlias,
              lazyAlias,
              lazySource.id,
              Object.keys(subscriptions)
            );
          }
          if (lazySourceSubscription.hasLoadedInitialState()) {
            return;
          }
          const joinKeys = data.getInner().map(([[joinKey]]) => joinKey);
          const lazyJoinRef = new PropRef(followRefResult.path);
          const loaded = lazySourceSubscription.requestSnapshot({
            where: inArray(lazyJoinRef, joinKeys),
            optimizedOnly: true
          });
          if (!loaded) {
            lazySourceSubscription.requestSnapshot();
          }
        })
      );
      if (activeSource === `main`) {
        mainPipeline = activePipelineWithLoading;
      } else {
        joinedPipeline = activePipelineWithLoading;
      }
    }
  }
  return mainPipeline.pipe(
    join(joinedPipeline, joinClause.type),
    processJoinResults(joinClause.type)
  );
}
function analyzeJoinExpressions(left, right, allAvailableSourceAliases, joinedSource) {
  const availableSources = allAvailableSourceAliases.filter(
    (alias) => alias !== joinedSource
  );
  const leftSourceAlias = getSourceAliasFromExpression(left);
  const rightSourceAlias = getSourceAliasFromExpression(right);
  if (leftSourceAlias && availableSources.includes(leftSourceAlias) && rightSourceAlias === joinedSource) {
    return { mainExpr: left, joinedExpr: right };
  }
  if (leftSourceAlias === joinedSource && rightSourceAlias && availableSources.includes(rightSourceAlias)) {
    return { mainExpr: right, joinedExpr: left };
  }
  if (!leftSourceAlias || !rightSourceAlias) {
    throw new InvalidJoinConditionSourceMismatchError();
  }
  if (leftSourceAlias === rightSourceAlias) {
    throw new InvalidJoinConditionSameSourceError(leftSourceAlias);
  }
  if (!availableSources.includes(leftSourceAlias)) {
    throw new InvalidJoinConditionLeftSourceError(leftSourceAlias);
  }
  if (rightSourceAlias !== joinedSource) {
    throw new InvalidJoinConditionRightSourceError(joinedSource);
  }
  throw new InvalidJoinCondition();
}
function getSourceAliasFromExpression(expr) {
  switch (expr.type) {
    case `ref`:
      return expr.path[0] || null;
    case `func`: {
      const sourceAliases = /* @__PURE__ */ new Set();
      for (const arg of expr.args) {
        const alias = getSourceAliasFromExpression(arg);
        if (alias) {
          sourceAliases.add(alias);
        }
      }
      return sourceAliases.size === 1 ? Array.from(sourceAliases)[0] : null;
    }
    default:
      return null;
  }
}
function processJoinSource(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, onCompileSubquery, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  switch (from.type) {
    case `collectionRef`: {
      const input = allInputs[from.alias];
      if (!input) {
        throw new CollectionInputNotFoundError(
          from.alias,
          from.collection.id,
          Object.keys(allInputs)
        );
      }
      aliasToCollectionId[from.alias] = from.collection.id;
      return { alias: from.alias, input, collectionId: from.collection.id };
    }
    case `queryRef`: {
      const originalQuery = queryMapping.get(from.query) || from.query;
      const subQueryResult = onCompileSubquery(
        originalQuery,
        allInputs,
        collections,
        subscriptions,
        callbacks,
        lazySources,
        optimizableOrderByCollections,
        setWindowFn,
        cache,
        queryMapping
      );
      Object.assign(aliasToCollectionId, subQueryResult.aliasToCollectionId);
      Object.assign(aliasRemapping, subQueryResult.aliasRemapping);
      const isUserDefinedSubquery = queryMapping.has(from.query);
      const fromInnerAlias = from.query.from.alias;
      const isOptimizerCreated = !isUserDefinedSubquery && from.alias === fromInnerAlias;
      if (!isOptimizerCreated) {
        for (const [alias, whereClause] of subQueryResult.sourceWhereClauses) {
          sourceWhereClauses.set(alias, whereClause);
        }
      }
      const innerAlias = Object.keys(subQueryResult.aliasToCollectionId).find(
        (alias) => subQueryResult.aliasToCollectionId[alias] === subQueryResult.collectionId
      );
      if (innerAlias && innerAlias !== from.alias) {
        aliasRemapping[from.alias] = innerAlias;
      }
      const subQueryInput = subQueryResult.pipeline;
      const extractedInput = subQueryInput.pipe(
        map((data) => {
          const [key, [value, _orderByIndex]] = data;
          return [key, value];
        })
      );
      return {
        alias: from.alias,
        input: extractedInput,
        collectionId: subQueryResult.collectionId
      };
    }
    default:
      throw new UnsupportedJoinSourceTypeError(from.type);
  }
}
function processJoinResults(joinType) {
  return function(pipeline) {
    return pipeline.pipe(
      // Process the join result and handle nulls
      filter((result) => {
        const [_key, [main, joined]] = result;
        const mainNamespacedRow = main?.[1];
        const joinedNamespacedRow = joined?.[1];
        if (joinType === `inner`) {
          return !!(mainNamespacedRow && joinedNamespacedRow);
        }
        if (joinType === `left`) {
          return !!mainNamespacedRow;
        }
        if (joinType === `right`) {
          return !!joinedNamespacedRow;
        }
        return true;
      }),
      map((result) => {
        const [_key, [main, joined]] = result;
        const mainKey = main?.[0];
        const mainNamespacedRow = main?.[1];
        const joinedKey = joined?.[0];
        const joinedNamespacedRow = joined?.[1];
        const mergedNamespacedRow = {};
        if (mainNamespacedRow) {
          Object.assign(mergedNamespacedRow, mainNamespacedRow);
        }
        if (joinedNamespacedRow) {
          Object.assign(mergedNamespacedRow, joinedNamespacedRow);
        }
        const resultKey = `[${mainKey},${joinedKey}]`;
        return [resultKey, mergedNamespacedRow];
      })
    );
  };
}
function getActiveAndLazySources(joinType, leftCollection, rightCollection) {
  switch (joinType) {
    case `left`:
      return { activeSource: `main`, lazySource: rightCollection };
    case `right`:
      return { activeSource: `joined`, lazySource: leftCollection };
    case `inner`:
      return leftCollection.size < rightCollection.size ? { activeSource: `main`, lazySource: rightCollection } : { activeSource: `joined`, lazySource: leftCollection };
    default:
      return { activeSource: void 0, lazySource: void 0 };
  }
}
function unwrapVal(input) {
  if (input instanceof Value) return input.value;
  return input;
}
function processMerge(op, namespacedRow, selectResults) {
  const value = op.source(namespacedRow);
  if (value && typeof value === `object`) {
    let cursor = selectResults;
    const path = op.targetPath;
    if (path.length === 0) {
      for (const [k, v] of Object.entries(value)) {
        selectResults[k] = unwrapVal(v);
      }
    } else {
      for (let i = 0; i < path.length; i++) {
        const seg = path[i];
        if (i === path.length - 1) {
          const dest = cursor[seg] ??= {};
          if (typeof dest === `object`) {
            for (const [k, v] of Object.entries(value)) {
              dest[k] = unwrapVal(v);
            }
          }
        } else {
          const next = cursor[seg];
          if (next == null || typeof next !== `object`) {
            cursor[seg] = {};
          }
          cursor = cursor[seg];
        }
      }
    }
  }
}
function processNonMergeOp(op, namespacedRow, selectResults) {
  const path = op.alias.split(`.`);
  if (path.length === 1) {
    selectResults[op.alias] = op.compiled(namespacedRow);
  } else {
    let cursor = selectResults;
    for (let i = 0; i < path.length - 1; i++) {
      const seg = path[i];
      const next = cursor[seg];
      if (next == null || typeof next !== `object`) {
        cursor[seg] = {};
      }
      cursor = cursor[seg];
    }
    cursor[path[path.length - 1]] = unwrapVal(op.compiled(namespacedRow));
  }
}
function processRow([key, namespacedRow], ops) {
  const selectResults = {};
  for (const op of ops) {
    if (op.kind === `merge`) {
      processMerge(op, namespacedRow, selectResults);
    } else {
      processNonMergeOp(op, namespacedRow, selectResults);
    }
  }
  return [
    key,
    {
      ...namespacedRow,
      $selected: selectResults
    }
  ];
}
function processSelect(pipeline, select, _allInputs) {
  const ops = [];
  addFromObject([], select, ops);
  return pipeline.pipe(map((row) => processRow(row, ops)));
}
function isAggregateExpression(expr) {
  return expr.type === `agg`;
}
function isNestedSelectObject(obj) {
  return obj && typeof obj === `object` && !isExpressionLike(obj);
}
function addFromObject(prefixPath, obj, ops) {
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith(`__SPREAD_SENTINEL__`)) {
      const rest = key.slice(`__SPREAD_SENTINEL__`.length);
      const splitIndex = rest.lastIndexOf(`__`);
      const pathStr = splitIndex >= 0 ? rest.slice(0, splitIndex) : rest;
      const isRefExpr = value && typeof value === `object` && `type` in value && value.type === `ref`;
      if (pathStr.includes(`.`) || isRefExpr) {
        const targetPath = [...prefixPath];
        const expr = isRefExpr ? value : new PropRef(pathStr.split(`.`));
        const compiled = compileExpression(expr);
        ops.push({ kind: `merge`, targetPath, source: compiled });
      } else {
        const tableAlias = pathStr;
        const targetPath = [...prefixPath];
        ops.push({
          kind: `merge`,
          targetPath,
          source: (row) => row[tableAlias]
        });
      }
      continue;
    }
    const expression = value;
    if (isNestedSelectObject(expression)) {
      addFromObject([...prefixPath, key], expression, ops);
      continue;
    }
    if (isAggregateExpression(expression) || containsAggregate(expression)) {
      ops.push({
        kind: `field`,
        alias: [...prefixPath, key].join(`.`),
        compiled: () => null
      });
    } else {
      if (expression === void 0 || !isExpressionLike(expression)) {
        ops.push({
          kind: `field`,
          alias: [...prefixPath, key].join(`.`),
          compiled: () => expression
        });
        continue;
      }
      if (expression instanceof Value) {
        const val = expression.value;
        ops.push({
          kind: `field`,
          alias: [...prefixPath, key].join(`.`),
          compiled: () => val
        });
      } else {
        ops.push({
          kind: `field`,
          alias: [...prefixPath, key].join(`.`),
          compiled: compileExpression(expression)
        });
      }
    }
  }
}
function compileQuery(rawQuery, inputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache = /* @__PURE__ */ new WeakMap(), queryMapping = /* @__PURE__ */ new WeakMap()) {
  const cachedResult = cache.get(rawQuery);
  if (cachedResult) {
    return cachedResult;
  }
  validateQueryStructure(rawQuery);
  const { optimizedQuery: query, sourceWhereClauses } = optimizeQuery(rawQuery);
  queryMapping.set(query, rawQuery);
  mapNestedQueries(query, rawQuery, queryMapping);
  const allInputs = { ...inputs };
  const aliasToCollectionId = {};
  const aliasRemapping = {};
  const sources = {};
  const {
    alias: mainSource,
    input: mainInput,
    collectionId: mainCollectionId
  } = processFrom(
    query.from,
    allInputs,
    collections,
    subscriptions,
    callbacks,
    lazySources,
    optimizableOrderByCollections,
    setWindowFn,
    cache,
    queryMapping,
    aliasToCollectionId,
    aliasRemapping,
    sourceWhereClauses
  );
  sources[mainSource] = mainInput;
  let pipeline = mainInput.pipe(
    map(([key, row]) => {
      const ret = [key, { [mainSource]: row }];
      return ret;
    })
  );
  if (query.join && query.join.length > 0) {
    pipeline = processJoins(
      pipeline,
      query.join,
      sources,
      mainCollectionId,
      mainSource,
      allInputs,
      cache,
      queryMapping,
      collections,
      subscriptions,
      callbacks,
      lazySources,
      optimizableOrderByCollections,
      setWindowFn,
      rawQuery,
      compileQuery,
      aliasToCollectionId,
      aliasRemapping,
      sourceWhereClauses
    );
  }
  if (query.where && query.where.length > 0) {
    for (const where of query.where) {
      const whereExpression = getWhereExpression(where);
      const compiledWhere = compileExpression(whereExpression);
      pipeline = pipeline.pipe(
        filter(([_key, namespacedRow]) => {
          return toBooleanPredicate(compiledWhere(namespacedRow));
        })
      );
    }
  }
  if (query.fnWhere && query.fnWhere.length > 0) {
    for (const fnWhere of query.fnWhere) {
      pipeline = pipeline.pipe(
        filter(([_key, namespacedRow]) => {
          return toBooleanPredicate(fnWhere(namespacedRow));
        })
      );
    }
  }
  if (query.distinct && !query.fnSelect && !query.select) {
    throw new DistinctRequiresSelectError();
  }
  if (query.fnSelect && query.groupBy && query.groupBy.length > 0) {
    throw new FnSelectWithGroupByError();
  }
  if (query.fnSelect) {
    pipeline = pipeline.pipe(
      map(([key, namespacedRow]) => {
        const selectResults = query.fnSelect(namespacedRow);
        return [
          key,
          {
            ...namespacedRow,
            $selected: selectResults
          }
        ];
      })
    );
  } else if (query.select) {
    pipeline = processSelect(pipeline, query.select);
  } else {
    pipeline = pipeline.pipe(
      map(([key, namespacedRow]) => {
        const selectResults = !query.join && !query.groupBy ? namespacedRow[mainSource] : namespacedRow;
        return [
          key,
          {
            ...namespacedRow,
            $selected: selectResults
          }
        ];
      })
    );
  }
  if (query.groupBy && query.groupBy.length > 0) {
    pipeline = processGroupBy(
      pipeline,
      query.groupBy,
      query.having,
      query.select,
      query.fnHaving
    );
  } else if (query.select) {
    const hasAggregates = Object.values(query.select).some(
      (expr) => expr.type === `agg` || containsAggregate(expr)
    );
    if (hasAggregates) {
      pipeline = processGroupBy(
        pipeline,
        [],
        // Empty group by means single group
        query.having,
        query.select,
        query.fnHaving
      );
    }
  }
  if (query.having && (!query.groupBy || query.groupBy.length === 0)) {
    const hasAggregates = query.select ? Object.values(query.select).some((expr) => expr.type === `agg`) : false;
    if (!hasAggregates) {
      throw new HavingRequiresGroupByError();
    }
  }
  if (query.fnHaving && query.fnHaving.length > 0 && (!query.groupBy || query.groupBy.length === 0)) {
    for (const fnHaving of query.fnHaving) {
      pipeline = pipeline.pipe(
        filter(([_key, namespacedRow]) => {
          return fnHaving(namespacedRow);
        })
      );
    }
  }
  if (query.distinct) {
    pipeline = pipeline.pipe(distinct(([_key, row]) => row.$selected));
  }
  if (query.orderBy && query.orderBy.length > 0) {
    const orderedPipeline = processOrderBy(
      rawQuery,
      pipeline,
      query.orderBy,
      query.select || {},
      collections[mainCollectionId],
      optimizableOrderByCollections,
      setWindowFn,
      query.limit,
      query.offset
    );
    const resultPipeline2 = orderedPipeline.pipe(
      map(([key, [row, orderByIndex]]) => {
        const raw = row.$selected;
        const finalResults = unwrapValue(raw);
        return [key, [finalResults, orderByIndex]];
      })
    );
    const result2 = resultPipeline2;
    const compilationResult2 = {
      collectionId: mainCollectionId,
      pipeline: result2,
      sourceWhereClauses,
      aliasToCollectionId,
      aliasRemapping
    };
    cache.set(rawQuery, compilationResult2);
    return compilationResult2;
  } else if (query.limit !== void 0 || query.offset !== void 0) {
    throw new LimitOffsetRequireOrderByError();
  }
  const resultPipeline = pipeline.pipe(
    map(([key, row]) => {
      const raw = row.$selected;
      const finalResults = unwrapValue(raw);
      return [key, [finalResults, void 0]];
    })
  );
  const result = resultPipeline;
  const compilationResult = {
    collectionId: mainCollectionId,
    pipeline: result,
    sourceWhereClauses,
    aliasToCollectionId,
    aliasRemapping
  };
  cache.set(rawQuery, compilationResult);
  return compilationResult;
}
function collectDirectCollectionAliases(query) {
  const aliases = /* @__PURE__ */ new Set();
  if (query.from.type === `collectionRef`) {
    aliases.add(query.from.alias);
  }
  if (query.join) {
    for (const joinClause of query.join) {
      if (joinClause.from.type === `collectionRef`) {
        aliases.add(joinClause.from.alias);
      }
    }
  }
  return aliases;
}
function validateQueryStructure(query, parentCollectionAliases = /* @__PURE__ */ new Set()) {
  const currentLevelAliases = collectDirectCollectionAliases(query);
  for (const alias of currentLevelAliases) {
    if (parentCollectionAliases.has(alias)) {
      throw new DuplicateAliasInSubqueryError(
        alias,
        Array.from(parentCollectionAliases)
      );
    }
  }
  const combinedAliases = /* @__PURE__ */ new Set([
    ...parentCollectionAliases,
    ...currentLevelAliases
  ]);
  if (query.from.type === `queryRef`) {
    validateQueryStructure(query.from.query, combinedAliases);
  }
  if (query.join) {
    for (const joinClause of query.join) {
      if (joinClause.from.type === `queryRef`) {
        validateQueryStructure(joinClause.from.query, combinedAliases);
      }
    }
  }
}
function processFrom(from, allInputs, collections, subscriptions, callbacks, lazySources, optimizableOrderByCollections, setWindowFn, cache, queryMapping, aliasToCollectionId, aliasRemapping, sourceWhereClauses) {
  switch (from.type) {
    case `collectionRef`: {
      const input = allInputs[from.alias];
      if (!input) {
        throw new CollectionInputNotFoundError(
          from.alias,
          from.collection.id,
          Object.keys(allInputs)
        );
      }
      aliasToCollectionId[from.alias] = from.collection.id;
      return { alias: from.alias, input, collectionId: from.collection.id };
    }
    case `queryRef`: {
      const originalQuery = queryMapping.get(from.query) || from.query;
      const subQueryResult = compileQuery(
        originalQuery,
        allInputs,
        collections,
        subscriptions,
        callbacks,
        lazySources,
        optimizableOrderByCollections,
        setWindowFn,
        cache,
        queryMapping
      );
      Object.assign(aliasToCollectionId, subQueryResult.aliasToCollectionId);
      Object.assign(aliasRemapping, subQueryResult.aliasRemapping);
      const isUserDefinedSubquery = queryMapping.has(from.query);
      const subqueryFromAlias = from.query.from.alias;
      const isOptimizerCreated = !isUserDefinedSubquery && from.alias === subqueryFromAlias;
      if (!isOptimizerCreated) {
        for (const [alias, whereClause] of subQueryResult.sourceWhereClauses) {
          sourceWhereClauses.set(alias, whereClause);
        }
      }
      const innerAlias = Object.keys(subQueryResult.aliasToCollectionId).find(
        (alias) => subQueryResult.aliasToCollectionId[alias] === subQueryResult.collectionId
      );
      if (innerAlias && innerAlias !== from.alias) {
        aliasRemapping[from.alias] = innerAlias;
      }
      const subQueryInput = subQueryResult.pipeline;
      const extractedInput = subQueryInput.pipe(
        map((data) => {
          const [key, [value, _orderByIndex]] = data;
          const unwrapped = unwrapValue(value);
          return [key, unwrapped];
        })
      );
      return {
        alias: from.alias,
        input: extractedInput,
        collectionId: subQueryResult.collectionId
      };
    }
    default:
      throw new UnsupportedFromTypeError(from.type);
  }
}
function isValue(raw) {
  return raw instanceof Value || raw && typeof raw === `object` && `type` in raw && raw.type === `val`;
}
function unwrapValue(value) {
  return isValue(value) ? value.value : value;
}
function mapNestedQueries(optimizedQuery, originalQuery, queryMapping) {
  if (optimizedQuery.from.type === `queryRef` && originalQuery.from.type === `queryRef`) {
    queryMapping.set(optimizedQuery.from.query, originalQuery.from.query);
    mapNestedQueries(
      optimizedQuery.from.query,
      originalQuery.from.query,
      queryMapping
    );
  }
  if (optimizedQuery.join && originalQuery.join) {
    for (let i = 0; i < optimizedQuery.join.length && i < originalQuery.join.length; i++) {
      const optimizedJoin = optimizedQuery.join[i];
      const originalJoin = originalQuery.join[i];
      if (optimizedJoin.from.type === `queryRef` && originalJoin.from.type === `queryRef`) {
        queryMapping.set(optimizedJoin.from.query, originalJoin.from.query);
        mapNestedQueries(
          optimizedJoin.from.query,
          originalJoin.from.query,
          queryMapping
        );
      }
    }
  }
}
function normalizeExpressionPaths(whereClause, collectionAlias) {
  const tpe = whereClause.type;
  if (tpe === `val`) {
    return new Value(whereClause.value);
  } else if (tpe === `ref`) {
    const path = whereClause.path;
    if (Array.isArray(path)) {
      if (path[0] === collectionAlias && path.length > 1) {
        return new PropRef(path.slice(1));
      } else if (path.length === 1 && path[0] !== void 0) {
        return new PropRef([path[0]]);
      }
    }
    return new PropRef(Array.isArray(path) ? path : [String(path)]);
  } else {
    const args = [];
    for (const arg of whereClause.args) {
      const convertedArg = normalizeExpressionPaths(
        arg,
        collectionAlias
      );
      args.push(convertedArg);
    }
    return new Func(whereClause.name, args);
  }
}
function normalizeOrderByPaths(orderBy, collectionAlias) {
  const normalizedOrderBy = orderBy.map((clause) => {
    const basicExp = normalizeExpressionPaths(
      clause.expression,
      collectionAlias
    );
    return {
      ...clause,
      expression: basicExp
    };
  });
  return normalizedOrderBy;
}
const collectionBuilderRegistry = /* @__PURE__ */ new WeakMap();
function getBuilderFromConfig(config) {
  return config.utils?.[LIVE_QUERY_INTERNAL]?.getBuilder?.();
}
function registerCollectionBuilder(collection, builder) {
  collectionBuilderRegistry.set(collection, builder);
}
function getCollectionBuilder(collection) {
  return collectionBuilderRegistry.get(collection);
}
class BaseQueryBuilder {
  constructor(query = {}) {
    this.query = {};
    this.query = { ...query };
  }
  /**
   * Creates a CollectionRef or QueryRef from a source object
   * @param source - An object with a single key-value pair
   * @param context - Context string for error messages (e.g., "from clause", "join clause")
   * @returns A tuple of [alias, ref] where alias is the source key and ref is the created reference
   */
  _createRefForSource(source, context) {
    let keys;
    try {
      keys = Object.keys(source);
    } catch {
      const type = source === null ? `null` : `undefined`;
      throw new InvalidSourceTypeError(context, type);
    }
    if (Array.isArray(source)) {
      throw new InvalidSourceTypeError(context, `array`);
    }
    if (keys.length !== 1) {
      if (keys.length === 0) {
        throw new InvalidSourceTypeError(context, `empty object`);
      }
      if (keys.every((k) => !isNaN(Number(k)))) {
        throw new InvalidSourceTypeError(context, `string`);
      }
      throw new OnlyOneSourceAllowedError(context);
    }
    const alias = keys[0];
    const sourceValue = source[alias];
    let ref;
    if (sourceValue instanceof CollectionImpl) {
      ref = new CollectionRef(sourceValue, alias);
    } else if (sourceValue instanceof BaseQueryBuilder) {
      const subQuery = sourceValue._getQuery();
      if (!subQuery.from) {
        throw new SubQueryMustHaveFromClauseError(context);
      }
      ref = new QueryRef(subQuery, alias);
    } else {
      throw new InvalidSourceError(alias);
    }
    return [alias, ref];
  }
  /**
   * Specify the source table or subquery for the query
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @returns A QueryBuilder with the specified source
   *
   * @example
   * ```ts
   * // Query from a collection
   * query.from({ users: usersCollection })
   *
   * // Query from a subquery
   * const activeUsers = query.from({ u: usersCollection }).where(({u}) => u.active)
   * query.from({ activeUsers })
   * ```
   */
  from(source) {
    const [, from] = this._createRefForSource(source, `from clause`);
    return new BaseQueryBuilder({
      ...this.query,
      from
    });
  }
  /**
   * Join another table or subquery to the current query
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @param type - The type of join: 'inner', 'left', 'right', or 'full' (defaults to 'left')
   * @returns A QueryBuilder with the joined table available
   *
   * @example
   * ```ts
   * // Left join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .join({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   *
   * // Inner join with explicit type
   * query
   *   .from({ u: usersCollection })
   *   .join({ p: postsCollection }, ({u, p}) => eq(u.id, p.userId), 'inner')
   * ```
   *
   * // Join with a subquery
   * const activeUsers = query.from({ u: usersCollection }).where(({u}) => u.active)
   * query
   *   .from({ activeUsers })
   *   .join({ p: postsCollection }, ({u, p}) => eq(u.id, p.userId))
   */
  join(source, onCallback, type = `left`) {
    const [alias, from] = this._createRefForSource(source, `join clause`);
    const currentAliases = this._getCurrentAliases();
    const newAliases = [...currentAliases, alias];
    const refProxy = createRefProxy(newAliases);
    const onExpression = onCallback(refProxy);
    let left;
    let right;
    if (onExpression.type === `func` && onExpression.name === `eq` && onExpression.args.length === 2) {
      left = onExpression.args[0];
      right = onExpression.args[1];
    } else {
      throw new JoinConditionMustBeEqualityError();
    }
    const joinClause = {
      from,
      type,
      left,
      right
    };
    const existingJoins = this.query.join || [];
    return new BaseQueryBuilder({
      ...this.query,
      join: [...existingJoins, joinClause]
    });
  }
  /**
   * Perform a LEFT JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the left joined table available
   *
   * @example
   * ```ts
   * // Left join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .leftJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  leftJoin(source, onCallback) {
    return this.join(source, onCallback, `left`);
  }
  /**
   * Perform a RIGHT JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the right joined table available
   *
   * @example
   * ```ts
   * // Right join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .rightJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  rightJoin(source, onCallback) {
    return this.join(source, onCallback, `right`);
  }
  /**
   * Perform an INNER JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the inner joined table available
   *
   * @example
   * ```ts
   * // Inner join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .innerJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  innerJoin(source, onCallback) {
    return this.join(source, onCallback, `inner`);
  }
  /**
   * Perform a FULL JOIN with another table or subquery
   *
   * @param source - An object with a single key-value pair where the key is the table alias and the value is a Collection or subquery
   * @param onCallback - A function that receives table references and returns the join condition
   * @returns A QueryBuilder with the full joined table available
   *
   * @example
   * ```ts
   * // Full join users with posts
   * query
   *   .from({ users: usersCollection })
   *   .fullJoin({ posts: postsCollection }, ({users, posts}) => eq(users.id, posts.userId))
   * ```
   */
  fullJoin(source, onCallback) {
    return this.join(source, onCallback, `full`);
  }
  /**
   * Filter rows based on a condition
   *
   * @param callback - A function that receives table references and returns an expression
   * @returns A QueryBuilder with the where condition applied
   *
   * @example
   * ```ts
   * // Simple condition
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => gt(users.age, 18))
   *
   * // Multiple conditions
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => and(
   *     gt(users.age, 18),
   *     eq(users.active, true)
   *   ))
   *
   * // Multiple where calls are ANDed together
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => gt(users.age, 18))
   *   .where(({users}) => eq(users.active, true))
   * ```
   */
  where(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = createRefProxy(aliases);
    const rawExpression = callback(refProxy);
    const expression = isRefProxy(rawExpression) ? toExpression(rawExpression) : rawExpression;
    if (!isExpressionLike(expression)) {
      throw new InvalidWhereExpressionError(getValueTypeName(expression));
    }
    const existingWhere = this.query.where || [];
    return new BaseQueryBuilder({
      ...this.query,
      where: [...existingWhere, expression]
    });
  }
  /**
   * Filter grouped rows based on aggregate conditions
   *
   * @param callback - A function that receives table references and returns an expression
   * @returns A QueryBuilder with the having condition applied
   *
   * @example
   * ```ts
   * // Filter groups by count
   * query
   *   .from({ posts: postsCollection })
   *   .groupBy(({posts}) => posts.userId)
   *   .having(({posts}) => gt(count(posts.id), 5))
   *
   * // Filter by average
   * query
   *   .from({ orders: ordersCollection })
   *   .groupBy(({orders}) => orders.customerId)
   *   .having(({orders}) => gt(avg(orders.total), 100))
   *
   * // Multiple having calls are ANDed together
   * query
   *   .from({ orders: ordersCollection })
   *   .groupBy(({orders}) => orders.customerId)
   *   .having(({orders}) => gt(count(orders.id), 5))
   *   .having(({orders}) => gt(avg(orders.total), 100))
   * ```
   */
  having(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = this.query.select || this.query.fnSelect ? createRefProxyWithSelected(aliases) : createRefProxy(aliases);
    const rawExpression = callback(refProxy);
    const expression = isRefProxy(rawExpression) ? toExpression(rawExpression) : rawExpression;
    if (!isExpressionLike(expression)) {
      throw new InvalidWhereExpressionError(getValueTypeName(expression));
    }
    const existingHaving = this.query.having || [];
    return new BaseQueryBuilder({
      ...this.query,
      having: [...existingHaving, expression]
    });
  }
  /**
   * Select specific columns or computed values from the query
   *
   * @param callback - A function that receives table references and returns an object with selected fields or expressions
   * @returns A QueryBuilder that returns only the selected fields
   *
   * @example
   * ```ts
   * // Select specific columns
   * query
   *   .from({ users: usersCollection })
   *   .select(({users}) => ({
   *     name: users.name,
   *     email: users.email
   *   }))
   *
   * // Select with computed values
   * query
   *   .from({ users: usersCollection })
   *   .select(({users}) => ({
   *     fullName: concat(users.firstName, ' ', users.lastName),
   *     ageInMonths: mul(users.age, 12)
   *   }))
   *
   * // Select with aggregates (requires GROUP BY)
   * query
   *   .from({ posts: postsCollection })
   *   .groupBy(({posts}) => posts.userId)
   *   .select(({posts, count}) => ({
   *     userId: posts.userId,
   *     postCount: count(posts.id)
   *   }))
   * ```
   */
  select(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = createRefProxy(aliases);
    const selectObject = callback(refProxy);
    const select = buildNestedSelect(selectObject);
    return new BaseQueryBuilder({
      ...this.query,
      select,
      fnSelect: void 0
      // remove the fnSelect clause if it exists
    });
  }
  /**
   * Sort the query results by one or more columns
   *
   * @param callback - A function that receives table references and returns the field to sort by
   * @param direction - Sort direction: 'asc' for ascending, 'desc' for descending (defaults to 'asc')
   * @returns A QueryBuilder with the ordering applied
   *
   * @example
   * ```ts
   * // Sort by a single column
   * query
   *   .from({ users: usersCollection })
   *   .orderBy(({users}) => users.name)
   *
   * // Sort descending
   * query
   *   .from({ users: usersCollection })
   *   .orderBy(({users}) => users.createdAt, 'desc')
   *
   * // Multiple sorts (chain orderBy calls)
   * query
   *   .from({ users: usersCollection })
   *   .orderBy(({users}) => users.lastName)
   *   .orderBy(({users}) => users.firstName)
   * ```
   */
  orderBy(callback, options = `asc`) {
    const aliases = this._getCurrentAliases();
    const refProxy = this.query.select || this.query.fnSelect ? createRefProxyWithSelected(aliases) : createRefProxy(aliases);
    const result = callback(refProxy);
    const opts = typeof options === `string` ? { direction: options, nulls: `first` } : {
      direction: options.direction ?? `asc`,
      nulls: options.nulls ?? `first`,
      stringSort: options.stringSort,
      locale: options.stringSort === `locale` ? options.locale : void 0,
      localeOptions: options.stringSort === `locale` ? options.localeOptions : void 0
    };
    const makeOrderByClause = (res) => {
      return {
        expression: toExpression(res),
        compareOptions: opts
      };
    };
    const orderByClauses = Array.isArray(result) ? result.map((r) => makeOrderByClause(r)) : [makeOrderByClause(result)];
    const existingOrderBy = this.query.orderBy || [];
    return new BaseQueryBuilder({
      ...this.query,
      orderBy: [...existingOrderBy, ...orderByClauses]
    });
  }
  /**
   * Group rows by one or more columns for aggregation
   *
   * @param callback - A function that receives table references and returns the field(s) to group by
   * @returns A QueryBuilder with grouping applied (enables aggregate functions in SELECT and HAVING)
   *
   * @example
   * ```ts
   * // Group by a single column
   * query
   *   .from({ posts: postsCollection })
   *   .groupBy(({posts}) => posts.userId)
   *   .select(({posts, count}) => ({
   *     userId: posts.userId,
   *     postCount: count()
   *   }))
   *
   * // Group by multiple columns
   * query
   *   .from({ sales: salesCollection })
   *   .groupBy(({sales}) => [sales.region, sales.category])
   *   .select(({sales, sum}) => ({
   *     region: sales.region,
   *     category: sales.category,
   *     totalSales: sum(sales.amount)
   *   }))
   * ```
   */
  groupBy(callback) {
    const aliases = this._getCurrentAliases();
    const refProxy = createRefProxy(aliases);
    const result = callback(refProxy);
    const newExpressions = Array.isArray(result) ? result.map((r) => toExpression(r)) : [toExpression(result)];
    const existingGroupBy = this.query.groupBy || [];
    return new BaseQueryBuilder({
      ...this.query,
      groupBy: [...existingGroupBy, ...newExpressions]
    });
  }
  /**
   * Limit the number of rows returned by the query
   * `orderBy` is required for `limit`
   *
   * @param count - Maximum number of rows to return
   * @returns A QueryBuilder with the limit applied
   *
   * @example
   * ```ts
   * // Get top 5 posts by likes
   * query
   *   .from({ posts: postsCollection })
   *   .orderBy(({posts}) => posts.likes, 'desc')
   *   .limit(5)
   * ```
   */
  limit(count2) {
    return new BaseQueryBuilder({
      ...this.query,
      limit: count2
    });
  }
  /**
   * Skip a number of rows before returning results
   * `orderBy` is required for `offset`
   *
   * @param count - Number of rows to skip
   * @returns A QueryBuilder with the offset applied
   *
   * @example
   * ```ts
   * // Get second page of results
   * query
   *   .from({ posts: postsCollection })
   *   .orderBy(({posts}) => posts.createdAt, 'desc')
   *   .offset(page * pageSize)
   *   .limit(pageSize)
   * ```
   */
  offset(count2) {
    return new BaseQueryBuilder({
      ...this.query,
      offset: count2
    });
  }
  /**
   * Specify that the query should return distinct rows.
   * Deduplicates rows based on the selected columns.
   * @returns A QueryBuilder with distinct enabled
   *
   * @example
   * ```ts
   * // Get countries our users are from
   * query
   *   .from({ users: usersCollection })
   *   .select(({users}) => users.country)
   *   .distinct()
   * ```
   */
  distinct() {
    return new BaseQueryBuilder({
      ...this.query,
      distinct: true
    });
  }
  /**
   * Specify that the query should return a single result
   * @returns A QueryBuilder that returns the first result
   *
   * @example
   * ```ts
   * // Get the user matching the query
   * query
   *   .from({ users: usersCollection })
   *   .where(({users}) => eq(users.id, 1))
   *   .findOne()
   *```
   */
  findOne() {
    return new BaseQueryBuilder({
      ...this.query,
      // TODO: enforcing return only one result with also a default orderBy if none is specified
      // limit: 1,
      singleResult: true
    });
  }
  // Helper methods
  _getCurrentAliases() {
    const aliases = [];
    if (this.query.from) {
      aliases.push(this.query.from.alias);
    }
    if (this.query.join) {
      for (const join2 of this.query.join) {
        aliases.push(join2.from.alias);
      }
    }
    return aliases;
  }
  /**
   * Functional variants of the query builder
   * These are imperative function that are called for ery row.
   * Warning: that these cannot be optimized by the query compiler, and may prevent
   * some type of optimizations being possible.
   * @example
   * ```ts
   * q.fn.select((row) => ({
   *   name: row.user.name.toUpperCase(),
   *   age: row.user.age + 1,
   * }))
   * ```
   */
  get fn() {
    const builder = this;
    return {
      /**
       * Select fields using a function that operates on each row
       * Warning: This cannot be optimized by the query compiler
       *
       * @param callback - A function that receives a row and returns the selected value
       * @returns A QueryBuilder with functional selection applied
       *
       * @example
       * ```ts
       * // Functional select (not optimized)
       * query
       *   .from({ users: usersCollection })
       *   .fn.select(row => ({
       *     name: row.users.name.toUpperCase(),
       *     age: row.users.age + 1,
       *   }))
       * ```
       */
      select(callback) {
        return new BaseQueryBuilder({
          ...builder.query,
          select: void 0,
          // remove the select clause if it exists
          fnSelect: callback
        });
      },
      /**
       * Filter rows using a function that operates on each row
       * Warning: This cannot be optimized by the query compiler
       *
       * @param callback - A function that receives a row and returns a boolean
       * @returns A QueryBuilder with functional filtering applied
       *
       * @example
       * ```ts
       * // Functional where (not optimized)
       * query
       *   .from({ users: usersCollection })
       *   .fn.where(row => row.users.name.startsWith('A'))
       * ```
       */
      where(callback) {
        return new BaseQueryBuilder({
          ...builder.query,
          fnWhere: [
            ...builder.query.fnWhere || [],
            callback
          ]
        });
      },
      /**
       * Filter grouped rows using a function that operates on each aggregated row
       * Warning: This cannot be optimized by the query compiler
       *
       * @param callback - A function that receives an aggregated row (with $selected when select() was called) and returns a boolean
       * @returns A QueryBuilder with functional having filter applied
       *
       * @example
       * ```ts
       * // Functional having (not optimized)
       * query
       *   .from({ posts: postsCollection })
       *   .groupBy(({posts}) => posts.userId)
       *   .select(({posts}) => ({ userId: posts.userId, count: count(posts.id) }))
       *   .fn.having(({ $selected }) => $selected.count > 5)
       * ```
       */
      having(callback) {
        return new BaseQueryBuilder({
          ...builder.query,
          fnHaving: [
            ...builder.query.fnHaving || [],
            callback
          ]
        });
      }
    };
  }
  _getQuery() {
    if (!this.query.from) {
      throw new QueryMustHaveFromClauseError();
    }
    return this.query;
  }
}
function getValueTypeName(value) {
  if (value === null) return `null`;
  if (value === void 0) return `undefined`;
  if (typeof value === `object`) return `object`;
  return typeof value;
}
function toExpr(value) {
  if (value === void 0) return toExpression(null);
  if (value instanceof Aggregate || value instanceof Func || value instanceof PropRef || value instanceof Value) {
    return value;
  }
  return toExpression(value);
}
function isPlainObject(value) {
  return value !== null && typeof value === `object` && !isExpressionLike(value) && !value.__refProxy;
}
function buildNestedSelect(obj) {
  if (!isPlainObject(obj)) return toExpr(obj);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof k === `string` && k.startsWith(`__SPREAD_SENTINEL__`)) {
      out[k] = v;
      continue;
    }
    out[k] = buildNestedSelect(v);
  }
  return out;
}
function buildQuery(fn) {
  const result = fn(new BaseQueryBuilder());
  return getQueryIR(result);
}
function getQueryIR(builder) {
  return builder._getQuery();
}
function extractCollectionsFromQuery(query) {
  const collections = {};
  function extractFromSource(source) {
    if (source.type === `collectionRef`) {
      collections[source.collection.id] = source.collection;
    } else if (source.type === `queryRef`) {
      extractFromQuery(source.query);
    }
  }
  function extractFromQuery(q) {
    if (q.from) {
      extractFromSource(q.from);
    }
    if (q.join && Array.isArray(q.join)) {
      for (const joinClause of q.join) {
        if (joinClause.from) {
          extractFromSource(joinClause.from);
        }
      }
    }
  }
  extractFromQuery(query);
  return collections;
}
function extractCollectionFromSource(query) {
  const from = query.from;
  if (from.type === `collectionRef`) {
    return from.collection;
  } else if (from.type === `queryRef`) {
    return extractCollectionFromSource(from.query);
  }
  throw new Error(
    `Failed to extract collection. Invalid FROM clause: ${JSON.stringify(query)}`
  );
}
function extractCollectionAliases(query) {
  const aliasesById = /* @__PURE__ */ new Map();
  function recordAlias(source) {
    if (!source) return;
    if (source.type === `collectionRef`) {
      const { id } = source.collection;
      const existing = aliasesById.get(id);
      if (existing) {
        existing.add(source.alias);
      } else {
        aliasesById.set(id, /* @__PURE__ */ new Set([source.alias]));
      }
    } else if (source.type === `queryRef`) {
      traverse(source.query);
    }
  }
  function traverse(q) {
    if (!q) return;
    recordAlias(q.from);
    if (q.join) {
      for (const joinClause of q.join) {
        recordAlias(joinClause.from);
      }
    }
  }
  traverse(query);
  return aliasesById;
}
function buildQueryFromConfig(config) {
  if (typeof config.query === `function`) {
    return buildQuery(config.query);
  }
  return getQueryIR(config.query);
}
function sendChangesToInput(input, changes, getKey) {
  const multiSetArray = [];
  for (const change of changes) {
    const key = getKey(change.value);
    if (change.type === `insert`) {
      multiSetArray.push([[key, change.value], 1]);
    } else if (change.type === `update`) {
      multiSetArray.push([[key, change.previousValue], -1]);
      multiSetArray.push([[key, change.value], 1]);
    } else {
      multiSetArray.push([[key, change.value], -1]);
    }
  }
  if (multiSetArray.length !== 0) {
    input.sendData(new MultiSet(multiSetArray));
  }
  return multiSetArray.length;
}
function* splitUpdates(changes) {
  for (const change of changes) {
    if (change.type === `update`) {
      yield { type: `delete`, key: change.key, value: change.previousValue };
      yield { type: `insert`, key: change.key, value: change.value };
    } else {
      yield change;
    }
  }
}
function filterDuplicateInserts(changes, sentKeys) {
  const filtered = [];
  for (const change of changes) {
    if (change.type === `insert`) {
      if (sentKeys.has(change.key)) {
        continue;
      }
      sentKeys.add(change.key);
    } else if (change.type === `delete`) {
      sentKeys.delete(change.key);
    }
    filtered.push(change);
  }
  return filtered;
}
function trackBiggestSentValue(changes, current, sentKeys, comparator) {
  let biggest = current;
  let shouldResetLoadKey = false;
  for (const change of changes) {
    if (change.type === `delete`) continue;
    const isNewKey = !sentKeys.has(change.key);
    if (biggest === void 0) {
      biggest = change.value;
      shouldResetLoadKey = true;
    } else if (comparator(biggest, change.value) < 0) {
      biggest = change.value;
      shouldResetLoadKey = true;
    } else if (isNewKey) {
      shouldResetLoadKey = true;
    }
  }
  return { biggest, shouldResetLoadKey };
}
function computeSubscriptionOrderByHints(query, alias) {
  const { orderBy, limit, offset } = query;
  const effectiveLimit = limit !== void 0 && offset !== void 0 ? limit + offset : limit;
  const normalizedOrderBy = orderBy ? normalizeOrderByPaths(orderBy, alias) : void 0;
  const canPassOrderBy = normalizedOrderBy?.every((clause) => {
    const exp = clause.expression;
    if (exp.type !== `ref`) return false;
    const path = exp.path;
    return Array.isArray(path) && path.length === 1;
  }) ?? false;
  return {
    orderBy: canPassOrderBy ? normalizedOrderBy : void 0,
    limit: canPassOrderBy ? effectiveLimit : void 0
  };
}
function computeOrderedLoadCursor(orderByInfo, biggestSentRow, lastLoadRequestKey, alias, limit) {
  const { orderBy, valueExtractorForRawRow, offset } = orderByInfo;
  const extractedValues = biggestSentRow ? valueExtractorForRawRow(biggestSentRow) : void 0;
  let minValues;
  if (extractedValues !== void 0) {
    minValues = Array.isArray(extractedValues) ? extractedValues : [extractedValues];
  }
  const loadRequestKey = serializeValue({
    minValues: minValues ?? null,
    offset,
    limit
  });
  if (lastLoadRequestKey === loadRequestKey) {
    return void 0;
  }
  const normalizedOrderBy = normalizeOrderByPaths(orderBy, alias);
  return { minValues, normalizedOrderBy, loadRequestKey };
}
const loadMoreCallbackSymbol = /* @__PURE__ */ Symbol.for(
  `@tanstack/db.collection-config-builder`
);
class CollectionSubscriber {
  constructor(alias, collectionId, collection, collectionConfigBuilder) {
    this.alias = alias;
    this.collectionId = collectionId;
    this.collection = collection;
    this.collectionConfigBuilder = collectionConfigBuilder;
    this.biggest = void 0;
    this.subscriptionLoadingPromises = /* @__PURE__ */ new Map();
    this.sentToD2Keys = /* @__PURE__ */ new Set();
  }
  subscribe() {
    const whereClause = this.getWhereClauseForAlias();
    if (whereClause) {
      const whereExpression = normalizeExpressionPaths(whereClause, this.alias);
      return this.subscribeToChanges(whereExpression);
    }
    return this.subscribeToChanges();
  }
  subscribeToChanges(whereExpression) {
    const orderByInfo = this.getOrderByInfo();
    const trackLoadResult = (result) => {
      if (result instanceof Promise) {
        this.collectionConfigBuilder.liveQueryCollection._sync.trackLoadPromise(
          result
        );
      }
    };
    const onStatusChange = (event) => {
      const subscription2 = event.subscription;
      if (event.status === `loadingSubset`) {
        this.ensureLoadingPromise(subscription2);
      } else {
        const deferred = this.subscriptionLoadingPromises.get(subscription2);
        if (deferred) {
          this.subscriptionLoadingPromises.delete(subscription2);
          deferred.resolve();
        }
      }
    };
    let subscription;
    if (orderByInfo) {
      subscription = this.subscribeToOrderedChanges(
        whereExpression,
        orderByInfo,
        onStatusChange,
        trackLoadResult
      );
    } else {
      const includeInitialState = !this.collectionConfigBuilder.isLazyAlias(
        this.alias
      );
      subscription = this.subscribeToMatchingChanges(
        whereExpression,
        includeInitialState,
        onStatusChange
      );
    }
    if (subscription.status === `loadingSubset`) {
      this.ensureLoadingPromise(subscription);
    }
    const unsubscribe = () => {
      const deferred = this.subscriptionLoadingPromises.get(subscription);
      if (deferred) {
        this.subscriptionLoadingPromises.delete(subscription);
        deferred.resolve();
      }
      subscription.unsubscribe();
    };
    this.collectionConfigBuilder.currentSyncState.unsubscribeCallbacks.add(
      unsubscribe
    );
    return subscription;
  }
  sendChangesToPipeline(changes, callback) {
    const changesArray = Array.isArray(changes) ? changes : [...changes];
    const filteredChanges = filterDuplicateInserts(
      changesArray,
      this.sentToD2Keys
    );
    const input = this.collectionConfigBuilder.currentSyncState.inputs[this.alias];
    const sentChanges = sendChangesToInput(
      input,
      filteredChanges,
      this.collection.config.getKey
    );
    const dataLoader = sentChanges > 0 ? callback : void 0;
    this.collectionConfigBuilder.scheduleGraphRun(dataLoader, {
      alias: this.alias
    });
  }
  subscribeToMatchingChanges(whereExpression, includeInitialState, onStatusChange) {
    const sendChanges = (changes) => {
      this.sendChangesToPipeline(changes);
    };
    const hints = computeSubscriptionOrderByHints(
      this.collectionConfigBuilder.query,
      this.alias
    );
    const onLoadSubsetResult = includeInitialState ? (result) => {
      if (result instanceof Promise) {
        this.collectionConfigBuilder.liveQueryCollection._sync.trackLoadPromise(
          result
        );
      }
    } : void 0;
    const subscription = this.collection.subscribeChanges(sendChanges, {
      ...includeInitialState && { includeInitialState },
      whereExpression,
      onStatusChange,
      orderBy: hints.orderBy,
      limit: hints.limit,
      onLoadSubsetResult
    });
    return subscription;
  }
  subscribeToOrderedChanges(whereExpression, orderByInfo, onStatusChange, onLoadSubsetResult) {
    const { orderBy, offset, limit, index } = orderByInfo;
    const handleLoadSubsetResult = (result) => {
      if (result instanceof Promise) {
        this.pendingOrderedLoadPromise = result;
        result.finally(() => {
          if (this.pendingOrderedLoadPromise === result) {
            this.pendingOrderedLoadPromise = void 0;
          }
        });
      }
      onLoadSubsetResult(result);
    };
    this.orderedLoadSubsetResult = handleLoadSubsetResult;
    const subscriptionHolder = {};
    const sendChangesInRange = (changes) => {
      const changesArray = Array.isArray(changes) ? changes : [...changes];
      this.trackSentValues(changesArray, orderByInfo.comparator);
      const splittedChanges = splitUpdates(changesArray);
      this.sendChangesToPipelineWithTracking(
        splittedChanges,
        subscriptionHolder.current
      );
    };
    const subscription = this.collection.subscribeChanges(sendChangesInRange, {
      whereExpression,
      onStatusChange
    });
    subscriptionHolder.current = subscription;
    const truncateUnsubscribe = this.collection.on(`truncate`, () => {
      this.biggest = void 0;
      this.lastLoadRequestKey = void 0;
      this.pendingOrderedLoadPromise = void 0;
      this.sentToD2Keys.clear();
    });
    subscription.on(`unsubscribed`, () => {
      truncateUnsubscribe();
    });
    const normalizedOrderBy = normalizeOrderByPaths(orderBy, this.alias);
    if (index) {
      subscription.setOrderByIndex(index);
      subscription.requestLimitedSnapshot({
        limit: offset + limit,
        orderBy: normalizedOrderBy,
        trackLoadSubsetPromise: false,
        onLoadSubsetResult: handleLoadSubsetResult
      });
    } else {
      subscription.requestSnapshot({
        orderBy: normalizedOrderBy,
        limit: offset + limit,
        trackLoadSubsetPromise: false,
        onLoadSubsetResult: handleLoadSubsetResult
      });
    }
    return subscription;
  }
  // This function is called by maybeRunGraph
  // after each iteration of the query pipeline
  // to ensure that the orderBy operator has enough data to work with
  loadMoreIfNeeded(subscription) {
    const orderByInfo = this.getOrderByInfo();
    if (!orderByInfo) {
      return true;
    }
    const { dataNeeded } = orderByInfo;
    if (!dataNeeded) {
      return true;
    }
    if (this.pendingOrderedLoadPromise) {
      return true;
    }
    const n = dataNeeded();
    if (n > 0) {
      this.loadNextItems(n, subscription);
    }
    return true;
  }
  sendChangesToPipelineWithTracking(changes, subscription) {
    const orderByInfo = this.getOrderByInfo();
    if (!orderByInfo) {
      this.sendChangesToPipeline(changes);
      return;
    }
    const subscriptionWithLoader = subscription;
    subscriptionWithLoader[loadMoreCallbackSymbol] ??= this.loadMoreIfNeeded.bind(this, subscription);
    this.sendChangesToPipeline(
      changes,
      subscriptionWithLoader[loadMoreCallbackSymbol]
    );
  }
  // Loads the next `n` items from the collection
  // starting from the biggest item it has sent
  loadNextItems(n, subscription) {
    const orderByInfo = this.getOrderByInfo();
    if (!orderByInfo) {
      return;
    }
    const cursor = computeOrderedLoadCursor(
      orderByInfo,
      this.biggest,
      this.lastLoadRequestKey,
      this.alias,
      n
    );
    if (!cursor) return;
    this.lastLoadRequestKey = cursor.loadRequestKey;
    subscription.requestLimitedSnapshot({
      orderBy: cursor.normalizedOrderBy,
      limit: n,
      minValues: cursor.minValues,
      trackLoadSubsetPromise: false,
      onLoadSubsetResult: this.orderedLoadSubsetResult
    });
  }
  getWhereClauseForAlias() {
    const sourceWhereClausesCache = this.collectionConfigBuilder.sourceWhereClausesCache;
    if (!sourceWhereClausesCache) {
      return void 0;
    }
    return sourceWhereClausesCache.get(this.alias);
  }
  getOrderByInfo() {
    const info = this.collectionConfigBuilder.optimizableOrderByCollections[this.collectionId];
    if (info && info.alias === this.alias) {
      return info;
    }
    return void 0;
  }
  trackSentValues(changes, comparator) {
    const result = trackBiggestSentValue(
      changes,
      this.biggest,
      this.sentToD2Keys,
      comparator
    );
    this.biggest = result.biggest;
    if (result.shouldResetLoadKey) {
      this.lastLoadRequestKey = void 0;
    }
  }
  ensureLoadingPromise(subscription) {
    if (this.subscriptionLoadingPromises.has(subscription)) {
      return;
    }
    let resolve;
    const promise = new Promise((res) => {
      resolve = res;
    });
    this.subscriptionLoadingPromises.set(subscription, {
      resolve
    });
    this.collectionConfigBuilder.liveQueryCollection._sync.trackLoadPromise(
      promise
    );
  }
}
let liveQueryCollectionCounter = 0;
class CollectionConfigBuilder {
  constructor(config) {
    this.config = config;
    this.compiledAliasToCollectionId = {};
    this.resultKeys = /* @__PURE__ */ new WeakMap();
    this.orderByIndices = /* @__PURE__ */ new WeakMap();
    this.isGraphRunning = false;
    this.runCount = 0;
    this.isInErrorState = false;
    this.aliasDependencies = {};
    this.builderDependencies = /* @__PURE__ */ new Set();
    this.pendingGraphRuns = /* @__PURE__ */ new Map();
    this.subscriptions = {};
    this.lazySourcesCallbacks = {};
    this.lazySources = /* @__PURE__ */ new Set();
    this.optimizableOrderByCollections = {};
    this.id = config.id || `live-query-${++liveQueryCollectionCounter}`;
    this.query = buildQueryFromConfig(config);
    this.collections = extractCollectionsFromQuery(this.query);
    const collectionAliasesById = extractCollectionAliases(this.query);
    this.collectionByAlias = {};
    for (const [collectionId, aliases] of collectionAliasesById.entries()) {
      const collection = this.collections[collectionId];
      if (!collection) continue;
      for (const alias of aliases) {
        this.collectionByAlias[alias] = collection;
      }
    }
    if (this.query.orderBy && this.query.orderBy.length > 0) {
      this.compare = createOrderByComparator(this.orderByIndices);
    }
    this.compareOptions = this.config.defaultStringCollation ?? extractCollectionFromSource(this.query).compareOptions;
    this.compileBasePipeline();
  }
  /**
   * Recursively checks if a query or any of its subqueries contains joins
   */
  hasJoins(query) {
    if (query.join && query.join.length > 0) {
      return true;
    }
    if (query.from.type === `queryRef`) {
      if (this.hasJoins(query.from.query)) {
        return true;
      }
    }
    return false;
  }
  getConfig() {
    return {
      id: this.id,
      getKey: this.config.getKey || ((item) => this.resultKeys.get(item)),
      sync: this.getSyncConfig(),
      compare: this.compare,
      defaultStringCollation: this.compareOptions,
      gcTime: this.config.gcTime || 5e3,
      // 5 seconds by default for live queries
      schema: this.config.schema,
      onInsert: this.config.onInsert,
      onUpdate: this.config.onUpdate,
      onDelete: this.config.onDelete,
      startSync: this.config.startSync,
      singleResult: this.query.singleResult,
      utils: {
        getRunCount: this.getRunCount.bind(this),
        setWindow: this.setWindow.bind(this),
        getWindow: this.getWindow.bind(this),
        [LIVE_QUERY_INTERNAL]: {
          getBuilder: () => this,
          hasCustomGetKey: !!this.config.getKey,
          hasJoins: this.hasJoins(this.query),
          hasDistinct: !!this.query.distinct
        }
      }
    };
  }
  setWindow(options) {
    if (!this.windowFn) {
      throw new SetWindowRequiresOrderByError();
    }
    this.currentWindow = options;
    this.windowFn(options);
    this.maybeRunGraphFn?.();
    if (this.liveQueryCollection?.isLoadingSubset) {
      return new Promise((resolve) => {
        const unsubscribe = this.liveQueryCollection.on(
          `loadingSubset:change`,
          (event) => {
            if (!event.isLoadingSubset) {
              unsubscribe();
              resolve();
            }
          }
        );
      });
    }
    return true;
  }
  getWindow() {
    if (!this.windowFn || !this.currentWindow) {
      return void 0;
    }
    return {
      offset: this.currentWindow.offset ?? 0,
      limit: this.currentWindow.limit ?? 0
    };
  }
  /**
   * Resolves a collection alias to its collection ID.
   *
   * Uses a two-tier lookup strategy:
   * 1. First checks compiled aliases (includes subquery inner aliases)
   * 2. Falls back to declared aliases from the query's from/join clauses
   *
   * @param alias - The alias to resolve (e.g., "employee", "manager")
   * @returns The collection ID that the alias references
   * @throws {Error} If the alias is not found in either lookup
   */
  getCollectionIdForAlias(alias) {
    const compiled = this.compiledAliasToCollectionId[alias];
    if (compiled) {
      return compiled;
    }
    const collection = this.collectionByAlias[alias];
    if (collection) {
      return collection.id;
    }
    throw new Error(`Unknown source alias "${alias}"`);
  }
  isLazyAlias(alias) {
    return this.lazySources.has(alias);
  }
  // The callback function is called after the graph has run.
  // This gives the callback a chance to load more data if needed,
  // that's used to optimize orderBy operators that set a limit,
  // in order to load some more data if we still don't have enough rows after the pipeline has run.
  // That can happen because even though we load N rows, the pipeline might filter some of these rows out
  // causing the orderBy operator to receive less than N rows or even no rows at all.
  // So this callback would notice that it doesn't have enough rows and load some more.
  // The callback returns a boolean, when it's true it's done loading data and we can mark the collection as ready.
  maybeRunGraph(callback) {
    if (this.isGraphRunning) {
      return;
    }
    if (!this.currentSyncConfig || !this.currentSyncState) {
      throw new Error(
        `maybeRunGraph called without active sync session. This should not happen.`
      );
    }
    this.isGraphRunning = true;
    try {
      const { begin, commit } = this.currentSyncConfig;
      const syncState = this.currentSyncState;
      if (this.isInErrorState) {
        return;
      }
      if (syncState.subscribedToAllCollections) {
        let callbackCalled = false;
        while (syncState.graph.pendingWork()) {
          syncState.graph.run();
          syncState.flushPendingChanges?.();
          callback?.();
          callbackCalled = true;
        }
        if (!callbackCalled) {
          callback?.();
        }
        if (syncState.messagesCount === 0) {
          begin();
          commit();
        }
        this.updateLiveQueryStatus(this.currentSyncConfig);
      }
    } finally {
      this.isGraphRunning = false;
    }
  }
  /**
   * Schedules a graph run with the transaction-scoped scheduler.
   * Ensures each builder runs at most once per transaction, with automatic dependency tracking
   * to run parent queries before child queries. Outside a transaction, runs immediately.
   *
   * Multiple calls during a transaction are coalesced into a single execution.
   * Dependencies are auto-discovered from subscribed live queries, or can be overridden.
   * Load callbacks are combined when entries merge.
   *
   * Uses the current sync session's config and syncState from instance properties.
   *
   * @param callback - Optional callback to load more data if needed (returns true when done)
   * @param options - Optional scheduling configuration
   * @param options.contextId - Transaction ID to group work; defaults to active transaction
   * @param options.jobId - Unique identifier for this job; defaults to this builder instance
   * @param options.alias - Source alias that triggered this schedule; adds alias-specific dependencies
   * @param options.dependencies - Explicit dependency list; overrides auto-discovered dependencies
   */
  scheduleGraphRun(callback, options) {
    const contextId = options?.contextId ?? getActiveTransaction()?.id;
    const jobId = options?.jobId ?? this;
    const dependentBuilders = (() => {
      if (options?.dependencies) {
        return options.dependencies;
      }
      const deps = new Set(this.builderDependencies);
      if (options?.alias) {
        const aliasDeps = this.aliasDependencies[options.alias];
        if (aliasDeps) {
          for (const dep of aliasDeps) {
            deps.add(dep);
          }
        }
      }
      deps.delete(this);
      return Array.from(deps);
    })();
    if (contextId) {
      for (const dep of dependentBuilders) {
        if (typeof dep.scheduleGraphRun === `function`) {
          dep.scheduleGraphRun(void 0, { contextId });
        }
      }
    }
    if (!this.currentSyncConfig || !this.currentSyncState) {
      throw new Error(
        `scheduleGraphRun called without active sync session. This should not happen.`
      );
    }
    let pending = contextId ? this.pendingGraphRuns.get(contextId) : void 0;
    if (!pending) {
      pending = {
        loadCallbacks: /* @__PURE__ */ new Set()
      };
      if (contextId) {
        this.pendingGraphRuns.set(contextId, pending);
      }
    }
    if (callback) {
      pending.loadCallbacks.add(callback);
    }
    const pendingToPass = contextId ? void 0 : pending;
    transactionScopedScheduler.schedule({
      contextId,
      jobId,
      dependencies: dependentBuilders,
      run: () => this.executeGraphRun(contextId, pendingToPass)
    });
  }
  /**
   * Clears pending graph run state for a specific context.
   * Called when the scheduler clears a context (e.g., transaction rollback/abort).
   */
  clearPendingGraphRun(contextId) {
    this.pendingGraphRuns.delete(contextId);
  }
  /**
   * Returns true if this builder has a pending graph run for the given context.
   */
  hasPendingGraphRun(contextId) {
    return this.pendingGraphRuns.has(contextId);
  }
  /**
   * Executes a pending graph run. Called by the scheduler when dependencies are satisfied.
   * Clears the pending state BEFORE execution so that any re-schedules during the run
   * create fresh state and don't interfere with the current execution.
   * Uses instance sync state - if sync has ended, gracefully returns without executing.
   *
   * @param contextId - Optional context ID to look up pending state
   * @param pendingParam - For immediate execution (no context), pending state is passed directly
   */
  executeGraphRun(contextId, pendingParam) {
    const pending = pendingParam ?? (contextId ? this.pendingGraphRuns.get(contextId) : void 0);
    if (contextId) {
      this.pendingGraphRuns.delete(contextId);
    }
    if (!pending) {
      return;
    }
    if (!this.currentSyncConfig || !this.currentSyncState) {
      return;
    }
    this.incrementRunCount();
    const combinedLoader = () => {
      let allDone = true;
      let firstError;
      pending.loadCallbacks.forEach((loader) => {
        try {
          allDone = loader() && allDone;
        } catch (error) {
          allDone = false;
          firstError ??= error;
        }
      });
      if (firstError) {
        throw firstError;
      }
      return allDone;
    };
    this.maybeRunGraph(combinedLoader);
  }
  getSyncConfig() {
    return {
      rowUpdateMode: `full`,
      sync: this.syncFn.bind(this)
    };
  }
  incrementRunCount() {
    this.runCount++;
  }
  getRunCount() {
    return this.runCount;
  }
  syncFn(config) {
    this.liveQueryCollection = config.collection;
    this.currentSyncConfig = config;
    const syncState = {
      messagesCount: 0,
      subscribedToAllCollections: false,
      unsubscribeCallbacks: /* @__PURE__ */ new Set()
    };
    const fullSyncState = this.extendPipelineWithChangeProcessing(
      config,
      syncState
    );
    this.currentSyncState = fullSyncState;
    this.unsubscribeFromSchedulerClears = transactionScopedScheduler.onClear(
      (contextId) => {
        this.clearPendingGraphRun(contextId);
      }
    );
    const loadingSubsetUnsubscribe = config.collection.on(
      `loadingSubset:change`,
      (event) => {
        if (!event.isLoadingSubset) {
          this.updateLiveQueryStatus(config);
        }
      }
    );
    syncState.unsubscribeCallbacks.add(loadingSubsetUnsubscribe);
    const loadSubsetDataCallbacks = this.subscribeToAllCollections(
      config,
      fullSyncState
    );
    this.maybeRunGraphFn = () => this.scheduleGraphRun(loadSubsetDataCallbacks);
    this.scheduleGraphRun(loadSubsetDataCallbacks);
    return () => {
      syncState.unsubscribeCallbacks.forEach((unsubscribe) => unsubscribe());
      this.currentSyncConfig = void 0;
      this.currentSyncState = void 0;
      this.pendingGraphRuns.clear();
      this.graphCache = void 0;
      this.inputsCache = void 0;
      this.pipelineCache = void 0;
      this.sourceWhereClausesCache = void 0;
      this.lazySources.clear();
      this.optimizableOrderByCollections = {};
      this.lazySourcesCallbacks = {};
      Object.keys(this.subscriptions).forEach(
        (key) => delete this.subscriptions[key]
      );
      this.compiledAliasToCollectionId = {};
      this.unsubscribeFromSchedulerClears?.();
      this.unsubscribeFromSchedulerClears = void 0;
    };
  }
  /**
   * Compiles the query pipeline with all declared aliases.
   */
  compileBasePipeline() {
    this.graphCache = new D2();
    this.inputsCache = Object.fromEntries(
      Object.keys(this.collectionByAlias).map((alias) => [
        alias,
        this.graphCache.newInput()
      ])
    );
    const compilation = compileQuery(
      this.query,
      this.inputsCache,
      this.collections,
      this.subscriptions,
      this.lazySourcesCallbacks,
      this.lazySources,
      this.optimizableOrderByCollections,
      (windowFn) => {
        this.windowFn = windowFn;
      }
    );
    this.pipelineCache = compilation.pipeline;
    this.sourceWhereClausesCache = compilation.sourceWhereClauses;
    this.compiledAliasToCollectionId = compilation.aliasToCollectionId;
    const missingAliases = Object.keys(this.compiledAliasToCollectionId).filter(
      (alias) => !Object.hasOwn(this.inputsCache, alias)
    );
    if (missingAliases.length > 0) {
      throw new MissingAliasInputsError(missingAliases);
    }
  }
  maybeCompileBasePipeline() {
    if (!this.graphCache || !this.inputsCache || !this.pipelineCache) {
      this.compileBasePipeline();
    }
    return {
      graph: this.graphCache,
      inputs: this.inputsCache,
      pipeline: this.pipelineCache
    };
  }
  extendPipelineWithChangeProcessing(config, syncState) {
    const { begin, commit } = config;
    const { graph, inputs, pipeline } = this.maybeCompileBasePipeline();
    let pendingChanges = /* @__PURE__ */ new Map();
    pipeline.pipe(
      output((data) => {
        const messages = data.getInner();
        syncState.messagesCount += messages.length;
        messages.reduce(accumulateChanges, pendingChanges);
      })
    );
    syncState.flushPendingChanges = () => {
      if (pendingChanges.size === 0) {
        return;
      }
      let changesToApply = pendingChanges;
      if (this.config.getKey) {
        const merged = /* @__PURE__ */ new Map();
        for (const [, changes] of pendingChanges) {
          const customKey = this.config.getKey(changes.value);
          const existing = merged.get(customKey);
          if (existing) {
            existing.inserts += changes.inserts;
            existing.deletes += changes.deletes;
            if (changes.inserts > 0) {
              existing.value = changes.value;
              if (changes.orderByIndex !== void 0) {
                existing.orderByIndex = changes.orderByIndex;
              }
            }
          } else {
            merged.set(customKey, { ...changes });
          }
        }
        changesToApply = merged;
      }
      begin();
      changesToApply.forEach(this.applyChanges.bind(this, config));
      commit();
      pendingChanges = /* @__PURE__ */ new Map();
    };
    graph.finalize();
    syncState.graph = graph;
    syncState.inputs = inputs;
    syncState.pipeline = pipeline;
    return syncState;
  }
  applyChanges(config, changes, key) {
    const { write, collection } = config;
    const { deletes, inserts, value, orderByIndex } = changes;
    this.resultKeys.set(value, key);
    if (orderByIndex !== void 0) {
      this.orderByIndices.set(value, orderByIndex);
    }
    if (inserts && deletes === 0) {
      write({
        value,
        type: `insert`
      });
    } else if (
      // Insert & update(s) (updates are a delete & insert)
      inserts > deletes || // Just update(s) but the item is already in the collection (so
      // was inserted previously).
      inserts === deletes && collection.has(collection.getKeyFromItem(value))
    ) {
      write({
        value,
        type: `update`
      });
    } else if (deletes > 0) {
      write({
        value,
        type: `delete`
      });
    } else {
      throw new Error(
        `Could not apply changes: ${JSON.stringify(changes)}. This should never happen.`
      );
    }
  }
  /**
   * Handle status changes from source collections
   */
  handleSourceStatusChange(config, collectionId, event) {
    const { status } = event;
    if (status === `error`) {
      this.transitionToError(
        `Source collection '${collectionId}' entered error state`
      );
      return;
    }
    if (status === `cleaned-up`) {
      this.transitionToError(
        `Source collection '${collectionId}' was manually cleaned up while live query '${this.id}' depends on it. Live queries prevent automatic GC, so this was likely a manual cleanup() call.`
      );
      return;
    }
    this.updateLiveQueryStatus(config);
  }
  /**
   * Update the live query status based on source collection statuses
   */
  updateLiveQueryStatus(config) {
    const { markReady } = config;
    if (this.isInErrorState) {
      return;
    }
    const subscribedToAll = this.currentSyncState?.subscribedToAllCollections;
    const allReady = this.allCollectionsReady();
    const isLoading = this.liveQueryCollection?.isLoadingSubset;
    if (subscribedToAll && allReady && !isLoading) {
      markReady();
    }
  }
  /**
   * Transition the live query to error state
   */
  transitionToError(message) {
    this.isInErrorState = true;
    console.error(`[Live Query Error] ${message}`);
    this.liveQueryCollection?._lifecycle.setStatus(`error`);
  }
  allCollectionsReady() {
    return Object.values(this.collections).every(
      (collection) => collection.isReady()
    );
  }
  /**
   * Creates per-alias subscriptions enabling self-join support.
   * Each alias gets its own subscription with independent filters, even for the same collection.
   * Example: `{ employee: col, manager: col }` creates two separate subscriptions.
   */
  subscribeToAllCollections(config, syncState) {
    const compiledAliases = Object.entries(this.compiledAliasToCollectionId);
    if (compiledAliases.length === 0) {
      throw new Error(
        `Compiler returned no alias metadata for query '${this.id}'. This should not happen; please report.`
      );
    }
    const loaders = compiledAliases.map(([alias, collectionId]) => {
      const collection = this.collectionByAlias[alias] ?? this.collections[collectionId];
      const dependencyBuilder = getCollectionBuilder(collection);
      if (dependencyBuilder && dependencyBuilder !== this) {
        this.aliasDependencies[alias] = [dependencyBuilder];
        this.builderDependencies.add(dependencyBuilder);
      } else {
        this.aliasDependencies[alias] = [];
      }
      const collectionSubscriber = new CollectionSubscriber(
        alias,
        collectionId,
        collection,
        this
      );
      const statusUnsubscribe = collection.on(`status:change`, (event) => {
        this.handleSourceStatusChange(config, collectionId, event);
      });
      syncState.unsubscribeCallbacks.add(statusUnsubscribe);
      const subscription = collectionSubscriber.subscribe();
      this.subscriptions[alias] = subscription;
      const loadMore = collectionSubscriber.loadMoreIfNeeded.bind(
        collectionSubscriber,
        subscription
      );
      return loadMore;
    });
    const loadSubsetDataCallbacks = () => {
      loaders.map((loader) => loader());
      return true;
    };
    syncState.subscribedToAllCollections = true;
    return loadSubsetDataCallbacks;
  }
}
function createOrderByComparator(orderByIndices) {
  return (val1, val2) => {
    const index1 = orderByIndices.get(val1);
    const index2 = orderByIndices.get(val2);
    if (index1 && index2) {
      if (index1 < index2) {
        return -1;
      } else if (index1 > index2) {
        return 1;
      } else {
        return 0;
      }
    }
    return 0;
  };
}
function accumulateChanges(acc, [[key, tupleData], multiplicity]) {
  const [value, orderByIndex] = tupleData;
  const changes = acc.get(key) || {
    deletes: 0,
    inserts: 0,
    value,
    orderByIndex
  };
  if (multiplicity < 0) {
    changes.deletes += Math.abs(multiplicity);
  } else if (multiplicity > 0) {
    changes.inserts += multiplicity;
    changes.value = value;
    if (orderByIndex !== void 0) {
      changes.orderByIndex = orderByIndex;
    }
  }
  acc.set(key, changes);
  return acc;
}
function liveQueryCollectionOptions(config) {
  const collectionConfigBuilder = new CollectionConfigBuilder(config);
  return collectionConfigBuilder.getConfig();
}
function createLiveQueryCollection(configOrQuery) {
  if (typeof configOrQuery === `function`) {
    const config = {
      query: configOrQuery
    };
    const options = liveQueryCollectionOptions(config);
    return bridgeToCreateCollection(options);
  } else {
    const config = configOrQuery;
    const options = liveQueryCollectionOptions(config);
    if (config.utils) {
      options.utils = { ...options.utils, ...config.utils };
    }
    return bridgeToCreateCollection(options);
  }
}
function bridgeToCreateCollection(options) {
  const collection = createCollection(options);
  const builder = getBuilderFromConfig(options);
  if (builder) {
    registerCollectionBuilder(collection, builder);
  }
  return collection;
}
const DEFAULT_GC_TIME_MS = 1;
function useLiveQuery(configOrQueryOrCollection, deps = []) {
  const isCollection = configOrQueryOrCollection && typeof configOrQueryOrCollection === `object` && typeof configOrQueryOrCollection.subscribeChanges === `function` && typeof configOrQueryOrCollection.startSyncImmediate === `function` && typeof configOrQueryOrCollection.id === `string`;
  const collectionRef = reactExports.useRef(
    null
  );
  const depsRef = reactExports.useRef(null);
  const configRef = reactExports.useRef(null);
  const versionRef = reactExports.useRef(0);
  const snapshotRef = reactExports.useRef(null);
  const needsNewCollection = !collectionRef.current || isCollection && configRef.current !== configOrQueryOrCollection || !isCollection && (depsRef.current === null || depsRef.current.length !== deps.length || depsRef.current.some((dep, i) => dep !== deps[i]));
  if (needsNewCollection) {
    if (isCollection) {
      const syncMode = configOrQueryOrCollection.config?.syncMode;
      if (syncMode === `on-demand`) {
        console.warn(
          `[useLiveQuery] Warning: Passing a collection with syncMode "on-demand" directly to useLiveQuery will not load any data. In on-demand mode, data is only loaded when queries with predicates request it.

Instead, use a query builder function:
  const { data } = useLiveQuery((q) => q.from({ c: myCollection }).select(({ c }) => c))

Or switch to syncMode "eager" if you want all data to sync automatically.`
        );
      }
      configOrQueryOrCollection.startSyncImmediate();
      collectionRef.current = configOrQueryOrCollection;
      configRef.current = configOrQueryOrCollection;
    } else {
      if (typeof configOrQueryOrCollection === `function`) {
        const queryBuilder = new BaseQueryBuilder();
        const result = configOrQueryOrCollection(queryBuilder);
        if (result === void 0 || result === null) {
          collectionRef.current = null;
        } else if (result instanceof CollectionImpl) {
          result.startSyncImmediate();
          collectionRef.current = result;
        } else if (result instanceof BaseQueryBuilder) {
          collectionRef.current = createLiveQueryCollection({
            query: configOrQueryOrCollection,
            startSync: true,
            gcTime: DEFAULT_GC_TIME_MS
          });
        } else if (result && typeof result === `object`) {
          collectionRef.current = createLiveQueryCollection({
            startSync: true,
            gcTime: DEFAULT_GC_TIME_MS,
            ...result
          });
        } else {
          throw new Error(
            `useLiveQuery callback must return a QueryBuilder, LiveQueryCollectionConfig, Collection, undefined, or null. Got: ${typeof result}`
          );
        }
        depsRef.current = [...deps];
      } else {
        collectionRef.current = createLiveQueryCollection({
          startSync: true,
          gcTime: DEFAULT_GC_TIME_MS,
          ...configOrQueryOrCollection
        });
        depsRef.current = [...deps];
      }
    }
  }
  if (needsNewCollection) {
    versionRef.current = 0;
    snapshotRef.current = null;
  }
  const subscribeRef = reactExports.useRef(null);
  if (!subscribeRef.current || needsNewCollection) {
    subscribeRef.current = (onStoreChange) => {
      if (!collectionRef.current) {
        return () => {
        };
      }
      const subscription = collectionRef.current.subscribeChanges(() => {
        versionRef.current += 1;
        onStoreChange();
      });
      if (collectionRef.current.status === `ready`) {
        versionRef.current += 1;
        onStoreChange();
      }
      return () => {
        subscription.unsubscribe();
      };
    };
  }
  const getSnapshotRef = reactExports.useRef(null);
  if (!getSnapshotRef.current || needsNewCollection) {
    getSnapshotRef.current = () => {
      const currentVersion = versionRef.current;
      const currentCollection = collectionRef.current;
      if (!snapshotRef.current || snapshotRef.current.version !== currentVersion || snapshotRef.current.collection !== currentCollection) {
        snapshotRef.current = {
          collection: currentCollection,
          version: currentVersion
        };
      }
      return snapshotRef.current;
    };
  }
  const snapshot = reactExports.useSyncExternalStore(
    subscribeRef.current,
    getSnapshotRef.current
  );
  const returnedSnapshotRef = reactExports.useRef(null);
  const returnedRef = reactExports.useRef(null);
  if (!returnedSnapshotRef.current || returnedSnapshotRef.current.version !== snapshot.version || returnedSnapshotRef.current.collection !== snapshot.collection) {
    if (!snapshot.collection) {
      returnedRef.current = {
        state: void 0,
        data: void 0,
        collection: void 0,
        status: `disabled`,
        isLoading: false,
        isReady: true,
        isIdle: false,
        isError: false,
        isCleanedUp: false,
        isEnabled: false
      };
    } else {
      const entries = Array.from(snapshot.collection.entries());
      const config = snapshot.collection.config;
      const singleResult = config.singleResult;
      let stateCache = null;
      let dataCache = null;
      returnedRef.current = {
        get state() {
          if (!stateCache) {
            stateCache = new Map(entries);
          }
          return stateCache;
        },
        get data() {
          if (!dataCache) {
            dataCache = entries.map(([, value]) => value);
          }
          return singleResult ? dataCache[0] : dataCache;
        },
        collection: snapshot.collection,
        status: snapshot.collection.status,
        isLoading: snapshot.collection.status === `loading`,
        isReady: snapshot.collection.status === `ready`,
        isIdle: snapshot.collection.status === `idle`,
        isError: snapshot.collection.status === `error`,
        isCleanedUp: snapshot.collection.status === `cleaned-up`,
        isEnabled: true
      };
    }
    returnedSnapshotRef.current = snapshot;
  }
  return returnedRef.current;
}
function memo(getDeps, fn, opts) {
  let deps = opts.initialDeps ?? [];
  let result;
  let isInitial = true;
  function memoizedFunction() {
    var _a, _b, _c;
    let depTime;
    if (opts.key && ((_a = opts.debug) == null ? void 0 : _a.call(opts))) depTime = Date.now();
    const newDeps = getDeps();
    const depsChanged = newDeps.length !== deps.length || newDeps.some((dep, index) => deps[index] !== dep);
    if (!depsChanged) {
      return result;
    }
    deps = newDeps;
    let resultTime;
    if (opts.key && ((_b = opts.debug) == null ? void 0 : _b.call(opts))) resultTime = Date.now();
    result = fn(...newDeps);
    if (opts.key && ((_c = opts.debug) == null ? void 0 : _c.call(opts))) {
      const depEndTime = Math.round((Date.now() - depTime) * 100) / 100;
      const resultEndTime = Math.round((Date.now() - resultTime) * 100) / 100;
      const resultFpsPercentage = resultEndTime / 16;
      const pad = (str, num) => {
        str = String(str);
        while (str.length < num) {
          str = " " + str;
        }
        return str;
      };
      console.info(
        `%c⏱ ${pad(resultEndTime, 5)} /${pad(depEndTime, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * resultFpsPercentage, 120)
        )}deg 100% 31%);`,
        opts == null ? void 0 : opts.key
      );
    }
    if ((opts == null ? void 0 : opts.onChange) && !(isInitial && opts.skipInitialOnChange)) {
      opts.onChange(result);
    }
    isInitial = false;
    return result;
  }
  memoizedFunction.updateDeps = (newDeps) => {
    deps = newDeps;
  };
  return memoizedFunction;
}
function notUndefined(value, msg) {
  if (value === void 0) {
    throw new Error(`Unexpected undefined${""}`);
  } else {
    return value;
  }
}
const approxEqual = (a, b) => Math.abs(a - b) < 1.01;
const debounce = (targetWindow, fn, ms2) => {
  let timeoutId;
  return function(...args) {
    targetWindow.clearTimeout(timeoutId);
    timeoutId = targetWindow.setTimeout(() => fn.apply(this, args), ms2);
  };
};
const getRect = (element) => {
  const { offsetWidth, offsetHeight } = element;
  return { width: offsetWidth, height: offsetHeight };
};
const defaultKeyExtractor = (index) => index;
const defaultRangeExtractor = (range2) => {
  const start = Math.max(range2.startIndex - range2.overscan, 0);
  const end = Math.min(range2.endIndex + range2.overscan, range2.count - 1);
  const arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
};
const observeElementRect = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  const handler = (rect) => {
    const { width, height } = rect;
    cb({ width: Math.round(width), height: Math.round(height) });
  };
  handler(getRect(element));
  if (!targetWindow.ResizeObserver) {
    return () => {
    };
  }
  const observer = new targetWindow.ResizeObserver((entries) => {
    const run = () => {
      const entry = entries[0];
      if (entry == null ? void 0 : entry.borderBoxSize) {
        const box = entry.borderBoxSize[0];
        if (box) {
          handler({ width: box.inlineSize, height: box.blockSize });
          return;
        }
      }
      handler(getRect(element));
    };
    instance.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
  });
  observer.observe(element, { box: "border-box" });
  return () => {
    observer.unobserve(element);
  };
};
const addEventListenerOptions = {
  passive: true
};
const supportsScrollend = typeof window == "undefined" ? true : "onscrollend" in window;
const observeElementOffset = (instance, cb) => {
  const element = instance.scrollElement;
  if (!element) {
    return;
  }
  const targetWindow = instance.targetWindow;
  if (!targetWindow) {
    return;
  }
  let offset = 0;
  const fallback = instance.options.useScrollendEvent && supportsScrollend ? () => void 0 : debounce(
    targetWindow,
    () => {
      cb(offset, false);
    },
    instance.options.isScrollingResetDelay
  );
  const createHandler = (isScrolling) => () => {
    const { horizontal, isRtl } = instance.options;
    offset = horizontal ? element["scrollLeft"] * (isRtl && -1 || 1) : element["scrollTop"];
    fallback();
    cb(offset, isScrolling);
  };
  const handler = createHandler(true);
  const endHandler = createHandler(false);
  element.addEventListener("scroll", handler, addEventListenerOptions);
  const registerScrollendEvent = instance.options.useScrollendEvent && supportsScrollend;
  if (registerScrollendEvent) {
    element.addEventListener("scrollend", endHandler, addEventListenerOptions);
  }
  return () => {
    element.removeEventListener("scroll", handler);
    if (registerScrollendEvent) {
      element.removeEventListener("scrollend", endHandler);
    }
  };
};
const measureElement = (element, entry, instance) => {
  if (entry == null ? void 0 : entry.borderBoxSize) {
    const box = entry.borderBoxSize[0];
    if (box) {
      const size = Math.round(
        box[instance.options.horizontal ? "inlineSize" : "blockSize"]
      );
      return size;
    }
  }
  return element[instance.options.horizontal ? "offsetWidth" : "offsetHeight"];
};
const elementScroll = (offset, {
  adjustments = 0,
  behavior
}, instance) => {
  var _a, _b;
  const toOffset = offset + adjustments;
  (_b = (_a = instance.scrollElement) == null ? void 0 : _a.scrollTo) == null ? void 0 : _b.call(_a, {
    [instance.options.horizontal ? "left" : "top"]: toOffset,
    behavior
  });
};
class Virtualizer {
  constructor(opts) {
    this.unsubs = [];
    this.scrollElement = null;
    this.targetWindow = null;
    this.isScrolling = false;
    this.scrollState = null;
    this.measurementsCache = [];
    this.itemSizeCache = /* @__PURE__ */ new Map();
    this.laneAssignments = /* @__PURE__ */ new Map();
    this.pendingMeasuredCacheIndexes = [];
    this.prevLanes = void 0;
    this.lanesChangedFlag = false;
    this.lanesSettling = false;
    this.scrollRect = null;
    this.scrollOffset = null;
    this.scrollDirection = null;
    this.scrollAdjustments = 0;
    this.elementsCache = /* @__PURE__ */ new Map();
    this.now = () => {
      var _a, _b, _c;
      return ((_c = (_b = (_a = this.targetWindow) == null ? void 0 : _a.performance) == null ? void 0 : _b.now) == null ? void 0 : _c.call(_b)) ?? Date.now();
    };
    this.observer = /* @__PURE__ */ (() => {
      let _ro = null;
      const get = () => {
        if (_ro) {
          return _ro;
        }
        if (!this.targetWindow || !this.targetWindow.ResizeObserver) {
          return null;
        }
        return _ro = new this.targetWindow.ResizeObserver((entries) => {
          entries.forEach((entry) => {
            const run = () => {
              const node2 = entry.target;
              const index = this.indexFromElement(node2);
              if (!node2.isConnected) {
                this.observer.unobserve(node2);
                return;
              }
              if (this.shouldMeasureDuringScroll(index)) {
                this.resizeItem(
                  index,
                  this.options.measureElement(node2, entry, this)
                );
              }
            };
            this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(run) : run();
          });
        });
      };
      return {
        disconnect: () => {
          var _a;
          (_a = get()) == null ? void 0 : _a.disconnect();
          _ro = null;
        },
        observe: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.observe(target, { box: "border-box" });
        },
        unobserve: (target) => {
          var _a;
          return (_a = get()) == null ? void 0 : _a.unobserve(target);
        }
      };
    })();
    this.range = null;
    this.setOptions = (opts2) => {
      Object.entries(opts2).forEach(([key, value]) => {
        if (typeof value === "undefined") delete opts2[key];
      });
      this.options = {
        debug: false,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: false,
        getItemKey: defaultKeyExtractor,
        rangeExtractor: defaultRangeExtractor,
        onChange: () => {
        },
        measureElement,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        isScrollingResetDelay: 150,
        enabled: true,
        isRtl: false,
        useScrollendEvent: false,
        useAnimationFrameWithResizeObserver: false,
        ...opts2
      };
    };
    this.notify = (sync) => {
      var _a, _b;
      (_b = (_a = this.options).onChange) == null ? void 0 : _b.call(_a, this, sync);
    };
    this.maybeNotify = memo(
      () => {
        this.calculateRange();
        return [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ];
      },
      (isScrolling) => {
        this.notify(isScrolling);
      },
      {
        key: false,
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    );
    this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((d) => d());
      this.unsubs = [];
      this.observer.disconnect();
      if (this.rafId != null && this.targetWindow) {
        this.targetWindow.cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.scrollState = null;
      this.scrollElement = null;
      this.targetWindow = null;
    };
    this._didMount = () => {
      return () => {
        this.cleanup();
      };
    };
    this._willUpdate = () => {
      var _a;
      const scrollElement = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== scrollElement) {
        this.cleanup();
        if (!scrollElement) {
          this.maybeNotify();
          return;
        }
        this.scrollElement = scrollElement;
        if (this.scrollElement && "ownerDocument" in this.scrollElement) {
          this.targetWindow = this.scrollElement.ownerDocument.defaultView;
        } else {
          this.targetWindow = ((_a = this.scrollElement) == null ? void 0 : _a.window) ?? null;
        }
        this.elementsCache.forEach((cached) => {
          this.observer.observe(cached);
        });
        this.unsubs.push(
          this.options.observeElementRect(this, (rect) => {
            this.scrollRect = rect;
            this.maybeNotify();
          })
        );
        this.unsubs.push(
          this.options.observeElementOffset(this, (offset, isScrolling) => {
            this.scrollAdjustments = 0;
            this.scrollDirection = isScrolling ? this.getScrollOffset() < offset ? "forward" : "backward" : null;
            this.scrollOffset = offset;
            this.isScrolling = isScrolling;
            if (this.scrollState) {
              this.scheduleScrollReconcile();
            }
            this.maybeNotify();
          })
        );
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
      }
    };
    this.rafId = null;
    this.getSize = () => {
      if (!this.options.enabled) {
        this.scrollRect = null;
        return 0;
      }
      this.scrollRect = this.scrollRect ?? this.options.initialRect;
      return this.scrollRect[this.options.horizontal ? "width" : "height"];
    };
    this.getScrollOffset = () => {
      if (!this.options.enabled) {
        this.scrollOffset = null;
        return 0;
      }
      this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset === "function" ? this.options.initialOffset() : this.options.initialOffset);
      return this.scrollOffset;
    };
    this.getFurthestMeasurement = (measurements, index) => {
      const furthestMeasurementsFound = /* @__PURE__ */ new Map();
      const furthestMeasurements = /* @__PURE__ */ new Map();
      for (let m = index - 1; m >= 0; m--) {
        const measurement = measurements[m];
        if (furthestMeasurementsFound.has(measurement.lane)) {
          continue;
        }
        const previousFurthestMeasurement = furthestMeasurements.get(
          measurement.lane
        );
        if (previousFurthestMeasurement == null || measurement.end > previousFurthestMeasurement.end) {
          furthestMeasurements.set(measurement.lane, measurement);
        } else if (measurement.end < previousFurthestMeasurement.end) {
          furthestMeasurementsFound.set(measurement.lane, true);
        }
        if (furthestMeasurementsFound.size === this.options.lanes) {
          break;
        }
      }
      return furthestMeasurements.size === this.options.lanes ? Array.from(furthestMeasurements.values()).sort((a, b) => {
        if (a.end === b.end) {
          return a.index - b.index;
        }
        return a.end - b.end;
      })[0] : void 0;
    };
    this.getMeasurementOptions = memo(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled,
        this.options.lanes
      ],
      (count2, paddingStart, scrollMargin, getItemKey, enabled, lanes) => {
        const lanesChanged = this.prevLanes !== void 0 && this.prevLanes !== lanes;
        if (lanesChanged) {
          this.lanesChangedFlag = true;
        }
        this.prevLanes = lanes;
        this.pendingMeasuredCacheIndexes = [];
        return {
          count: count2,
          paddingStart,
          scrollMargin,
          getItemKey,
          enabled,
          lanes
        };
      },
      {
        key: false
      }
    );
    this.getMeasurements = memo(
      () => [this.getMeasurementOptions(), this.itemSizeCache],
      ({ count: count2, paddingStart, scrollMargin, getItemKey, enabled, lanes }, itemSizeCache) => {
        if (!enabled) {
          this.measurementsCache = [];
          this.itemSizeCache.clear();
          this.laneAssignments.clear();
          return [];
        }
        if (this.laneAssignments.size > count2) {
          for (const index of this.laneAssignments.keys()) {
            if (index >= count2) {
              this.laneAssignments.delete(index);
            }
          }
        }
        if (this.lanesChangedFlag) {
          this.lanesChangedFlag = false;
          this.lanesSettling = true;
          this.measurementsCache = [];
          this.itemSizeCache.clear();
          this.laneAssignments.clear();
          this.pendingMeasuredCacheIndexes = [];
        }
        if (this.measurementsCache.length === 0 && !this.lanesSettling) {
          this.measurementsCache = this.options.initialMeasurementsCache;
          this.measurementsCache.forEach((item) => {
            this.itemSizeCache.set(item.key, item.size);
          });
        }
        const min2 = this.lanesSettling ? 0 : this.pendingMeasuredCacheIndexes.length > 0 ? Math.min(...this.pendingMeasuredCacheIndexes) : 0;
        this.pendingMeasuredCacheIndexes = [];
        if (this.lanesSettling && this.measurementsCache.length === count2) {
          this.lanesSettling = false;
        }
        const measurements = this.measurementsCache.slice(0, min2);
        const laneLastIndex = new Array(lanes).fill(
          void 0
        );
        for (let m = 0; m < min2; m++) {
          const item = measurements[m];
          if (item) {
            laneLastIndex[item.lane] = m;
          }
        }
        for (let i = min2; i < count2; i++) {
          const key = getItemKey(i);
          const cachedLane = this.laneAssignments.get(i);
          let lane;
          let start;
          if (cachedLane !== void 0 && this.options.lanes > 1) {
            lane = cachedLane;
            const prevIndex = laneLastIndex[lane];
            const prevInLane = prevIndex !== void 0 ? measurements[prevIndex] : void 0;
            start = prevInLane ? prevInLane.end + this.options.gap : paddingStart + scrollMargin;
          } else {
            const furthestMeasurement = this.options.lanes === 1 ? measurements[i - 1] : this.getFurthestMeasurement(measurements, i);
            start = furthestMeasurement ? furthestMeasurement.end + this.options.gap : paddingStart + scrollMargin;
            lane = furthestMeasurement ? furthestMeasurement.lane : i % this.options.lanes;
            if (this.options.lanes > 1) {
              this.laneAssignments.set(i, lane);
            }
          }
          const measuredSize = itemSizeCache.get(key);
          const size = typeof measuredSize === "number" ? measuredSize : this.options.estimateSize(i);
          const end = start + size;
          measurements[i] = {
            index: i,
            start,
            size,
            end,
            key,
            lane
          };
          laneLastIndex[lane] = i;
        }
        this.measurementsCache = measurements;
        return measurements;
      },
      {
        key: false,
        debug: () => this.options.debug
      }
    );
    this.calculateRange = memo(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (measurements, outerSize, scrollOffset, lanes) => {
        return this.range = measurements.length > 0 && outerSize > 0 ? calculateRange({
          measurements,
          outerSize,
          scrollOffset,
          lanes
        }) : null;
      },
      {
        key: false,
        debug: () => this.options.debug
      }
    );
    this.getVirtualIndexes = memo(
      () => {
        let startIndex = null;
        let endIndex = null;
        const range2 = this.calculateRange();
        if (range2) {
          startIndex = range2.startIndex;
          endIndex = range2.endIndex;
        }
        this.maybeNotify.updateDeps([this.isScrolling, startIndex, endIndex]);
        return [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          startIndex,
          endIndex
        ];
      },
      (rangeExtractor, overscan, count2, startIndex, endIndex) => {
        return startIndex === null || endIndex === null ? [] : rangeExtractor({
          startIndex,
          endIndex,
          overscan,
          count: count2
        });
      },
      {
        key: false,
        debug: () => this.options.debug
      }
    );
    this.indexFromElement = (node2) => {
      const attributeName = this.options.indexAttribute;
      const indexStr = node2.getAttribute(attributeName);
      if (!indexStr) {
        console.warn(
          `Missing attribute name '${attributeName}={index}' on measured element.`
        );
        return -1;
      }
      return parseInt(indexStr, 10);
    };
    this.shouldMeasureDuringScroll = (index) => {
      var _a;
      if (!this.scrollState || this.scrollState.behavior !== "smooth") {
        return true;
      }
      const scrollIndex = this.scrollState.index ?? ((_a = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null ? void 0 : _a.index);
      if (scrollIndex !== void 0 && this.range) {
        const bufferSize = Math.max(
          this.options.overscan,
          Math.ceil((this.range.endIndex - this.range.startIndex) / 2)
        );
        const minIndex = Math.max(0, scrollIndex - bufferSize);
        const maxIndex = Math.min(
          this.options.count - 1,
          scrollIndex + bufferSize
        );
        return index >= minIndex && index <= maxIndex;
      }
      return true;
    };
    this.measureElement = (node2) => {
      if (!node2) {
        this.elementsCache.forEach((cached, key2) => {
          if (!cached.isConnected) {
            this.observer.unobserve(cached);
            this.elementsCache.delete(key2);
          }
        });
        return;
      }
      const index = this.indexFromElement(node2);
      const key = this.options.getItemKey(index);
      const prevNode = this.elementsCache.get(key);
      if (prevNode !== node2) {
        if (prevNode) {
          this.observer.unobserve(prevNode);
        }
        this.observer.observe(node2);
        this.elementsCache.set(key, node2);
      }
      if ((!this.isScrolling || this.scrollState) && this.shouldMeasureDuringScroll(index)) {
        this.resizeItem(index, this.options.measureElement(node2, void 0, this));
      }
    };
    this.resizeItem = (index, size) => {
      var _a;
      const item = this.measurementsCache[index];
      if (!item) return;
      const itemSize = this.itemSizeCache.get(item.key) ?? item.size;
      const delta = size - itemSize;
      if (delta !== 0) {
        if (((_a = this.scrollState) == null ? void 0 : _a.behavior) !== "smooth" && (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(item, delta, this) : item.start < this.getScrollOffset() + this.scrollAdjustments)) {
          this._scrollToOffset(this.getScrollOffset(), {
            adjustments: this.scrollAdjustments += delta,
            behavior: void 0
          });
        }
        this.pendingMeasuredCacheIndexes.push(item.index);
        this.itemSizeCache = new Map(this.itemSizeCache.set(item.key, size));
        this.notify(false);
      }
    };
    this.getVirtualItems = memo(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (indexes, measurements) => {
        const virtualItems = [];
        for (let k = 0, len = indexes.length; k < len; k++) {
          const i = indexes[k];
          const measurement = measurements[i];
          virtualItems.push(measurement);
        }
        return virtualItems;
      },
      {
        key: false,
        debug: () => this.options.debug
      }
    );
    this.getVirtualItemForOffset = (offset) => {
      const measurements = this.getMeasurements();
      if (measurements.length === 0) {
        return void 0;
      }
      return notUndefined(
        measurements[findNearestBinarySearch(
          0,
          measurements.length - 1,
          (index) => notUndefined(measurements[index]).start,
          offset
        )]
      );
    };
    this.getMaxScrollOffset = () => {
      if (!this.scrollElement) return 0;
      if ("scrollHeight" in this.scrollElement) {
        return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      } else {
        const doc = this.scrollElement.document.documentElement;
        return this.options.horizontal ? doc.scrollWidth - this.scrollElement.innerWidth : doc.scrollHeight - this.scrollElement.innerHeight;
      }
    };
    this.getOffsetForAlignment = (toOffset, align, itemSize = 0) => {
      if (!this.scrollElement) return 0;
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      if (align === "auto") {
        align = toOffset >= scrollOffset + size ? "end" : "start";
      }
      if (align === "center") {
        toOffset += (itemSize - size) / 2;
      } else if (align === "end") {
        toOffset -= size;
      }
      const maxOffset = this.getMaxScrollOffset();
      return Math.max(Math.min(maxOffset, toOffset), 0);
    };
    this.getOffsetForIndex = (index, align = "auto") => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      const size = this.getSize();
      const scrollOffset = this.getScrollOffset();
      const item = this.measurementsCache[index];
      if (!item) return;
      if (align === "auto") {
        if (item.end >= scrollOffset + size - this.options.scrollPaddingEnd) {
          align = "end";
        } else if (item.start <= scrollOffset + this.options.scrollPaddingStart) {
          align = "start";
        } else {
          return [scrollOffset, align];
        }
      }
      if (align === "end" && index === this.options.count - 1) {
        return [this.getMaxScrollOffset(), align];
      }
      const toOffset = align === "end" ? item.end + this.options.scrollPaddingEnd : item.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(toOffset, align, item.size),
        align
      ];
    };
    this.scrollToOffset = (toOffset, { align = "start", behavior = "auto" } = {}) => {
      const offset = this.getOffsetForAlignment(toOffset, align);
      const now = this.now();
      this.scrollState = {
        index: null,
        align,
        behavior,
        startedAt: now,
        lastTargetOffset: offset,
        stableFrames: 0
      };
      this._scrollToOffset(offset, { adjustments: void 0, behavior });
      this.scheduleScrollReconcile();
    };
    this.scrollToIndex = (index, {
      align: initialAlign = "auto",
      behavior = "auto"
    } = {}) => {
      index = Math.max(0, Math.min(index, this.options.count - 1));
      const offsetInfo = this.getOffsetForIndex(index, initialAlign);
      if (!offsetInfo) {
        return;
      }
      const [offset, align] = offsetInfo;
      const now = this.now();
      this.scrollState = {
        index,
        align,
        behavior,
        startedAt: now,
        lastTargetOffset: offset,
        stableFrames: 0
      };
      this._scrollToOffset(offset, { adjustments: void 0, behavior });
      this.scheduleScrollReconcile();
    };
    this.scrollBy = (delta, { behavior = "auto" } = {}) => {
      const offset = this.getScrollOffset() + delta;
      const now = this.now();
      this.scrollState = {
        index: null,
        align: "start",
        behavior,
        startedAt: now,
        lastTargetOffset: offset,
        stableFrames: 0
      };
      this._scrollToOffset(offset, { adjustments: void 0, behavior });
      this.scheduleScrollReconcile();
    };
    this.getTotalSize = () => {
      var _a;
      const measurements = this.getMeasurements();
      let end;
      if (measurements.length === 0) {
        end = this.options.paddingStart;
      } else if (this.options.lanes === 1) {
        end = ((_a = measurements[measurements.length - 1]) == null ? void 0 : _a.end) ?? 0;
      } else {
        const endByLane = Array(this.options.lanes).fill(null);
        let endIndex = measurements.length - 1;
        while (endIndex >= 0 && endByLane.some((val) => val === null)) {
          const item = measurements[endIndex];
          if (endByLane[item.lane] === null) {
            endByLane[item.lane] = item.end;
          }
          endIndex--;
        }
        end = Math.max(...endByLane.filter((val) => val !== null));
      }
      return Math.max(
        end - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    };
    this._scrollToOffset = (offset, {
      adjustments,
      behavior
    }) => {
      this.options.scrollToFn(offset, { behavior, adjustments }, this);
    };
    this.measure = () => {
      this.itemSizeCache = /* @__PURE__ */ new Map();
      this.laneAssignments = /* @__PURE__ */ new Map();
      this.notify(false);
    };
    this.setOptions(opts);
  }
  scheduleScrollReconcile() {
    if (!this.targetWindow) {
      this.scrollState = null;
      return;
    }
    if (this.rafId != null) return;
    this.rafId = this.targetWindow.requestAnimationFrame(() => {
      this.rafId = null;
      this.reconcileScroll();
    });
  }
  reconcileScroll() {
    if (!this.scrollState) return;
    const el = this.scrollElement;
    if (!el) return;
    const MAX_RECONCILE_MS = 5e3;
    if (this.now() - this.scrollState.startedAt > MAX_RECONCILE_MS) {
      this.scrollState = null;
      return;
    }
    const offsetInfo = this.scrollState.index != null ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align) : void 0;
    const targetOffset = offsetInfo ? offsetInfo[0] : this.scrollState.lastTargetOffset;
    const STABLE_FRAMES = 1;
    const targetChanged = targetOffset !== this.scrollState.lastTargetOffset;
    if (!targetChanged && approxEqual(targetOffset, this.getScrollOffset())) {
      this.scrollState.stableFrames++;
      if (this.scrollState.stableFrames >= STABLE_FRAMES) {
        this.scrollState = null;
        return;
      }
    } else {
      this.scrollState.stableFrames = 0;
      if (targetChanged) {
        this.scrollState.lastTargetOffset = targetOffset;
        this.scrollState.behavior = "auto";
        this._scrollToOffset(targetOffset, {
          adjustments: void 0,
          behavior: "auto"
        });
      }
    }
    this.scheduleScrollReconcile();
  }
}
const findNearestBinarySearch = (low, high, getCurrentValue, value) => {
  while (low <= high) {
    const middle = (low + high) / 2 | 0;
    const currentValue = getCurrentValue(middle);
    if (currentValue < value) {
      low = middle + 1;
    } else if (currentValue > value) {
      high = middle - 1;
    } else {
      return middle;
    }
  }
  if (low > 0) {
    return low - 1;
  } else {
    return 0;
  }
};
function calculateRange({
  measurements,
  outerSize,
  scrollOffset,
  lanes
}) {
  const lastIndex = measurements.length - 1;
  const getOffset = (index) => measurements[index].start;
  if (measurements.length <= lanes) {
    return {
      startIndex: 0,
      endIndex: lastIndex
    };
  }
  let startIndex = findNearestBinarySearch(
    0,
    lastIndex,
    getOffset,
    scrollOffset
  );
  let endIndex = startIndex;
  if (lanes === 1) {
    while (endIndex < lastIndex && measurements[endIndex].end < scrollOffset + outerSize) {
      endIndex++;
    }
  } else if (lanes > 1) {
    const endPerLane = Array(lanes).fill(0);
    while (endIndex < lastIndex && endPerLane.some((pos) => pos < scrollOffset + outerSize)) {
      const item = measurements[endIndex];
      endPerLane[item.lane] = item.end;
      endIndex++;
    }
    const startPerLane = Array(lanes).fill(scrollOffset + outerSize);
    while (startIndex >= 0 && startPerLane.some((pos) => pos >= scrollOffset)) {
      const item = measurements[startIndex];
      startPerLane[item.lane] = item.start;
      startIndex--;
    }
    startIndex = Math.max(0, startIndex - startIndex % lanes);
    endIndex = Math.min(lastIndex, endIndex + (lanes - 1 - endIndex % lanes));
  }
  return { startIndex, endIndex };
}
const useIsomorphicLayoutEffect = typeof document !== "undefined" ? reactExports.useLayoutEffect : reactExports.useEffect;
function useVirtualizerBase({
  useFlushSync = true,
  ...options
}) {
  const rerender = reactExports.useReducer(() => ({}), {})[1];
  const resolvedOptions = {
    ...options,
    onChange: (instance2, sync) => {
      var _a;
      if (useFlushSync && sync) {
        reactDomExports.flushSync(rerender);
      } else {
        rerender();
      }
      (_a = options.onChange) == null ? void 0 : _a.call(options, instance2, sync);
    }
  };
  const [instance] = reactExports.useState(
    () => new Virtualizer(resolvedOptions)
  );
  instance.setOptions(resolvedOptions);
  useIsomorphicLayoutEffect(() => {
    return instance._didMount();
  }, []);
  useIsomorphicLayoutEffect(() => {
    return instance._willUpdate();
  });
  return instance;
}
function useVirtualizer(options) {
  return useVirtualizerBase({
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    ...options
  });
}
var nestedKeys = /* @__PURE__ */ new Set(["style"]);
var isNewReact = "use" in React;
var fixedMap = {
  srcset: "srcSet",
  fetchpriority: isNewReact ? "fetchPriority" : "fetchpriority"
};
var camelize = (key) => {
  if (key.startsWith("data-") || key.startsWith("aria-")) {
    return key;
  }
  return fixedMap[key] || key.replace(/-./g, (suffix) => suffix[1].toUpperCase());
};
function camelizeProps(props) {
  return Object.fromEntries(
    Object.entries(props).map(([k, v]) => [
      camelize(k),
      nestedKeys.has(k) && v && typeof v !== "string" ? camelizeProps(v) : v
    ])
  );
}
var getSizes = (width, layout) => {
  if (!width || !layout) {
    return void 0;
  }
  switch (layout) {
    // If screen is wider than the max size, image width is the max size,
    // otherwise it's the width of the screen
    case `constrained`:
      return `(min-width: ${width}px) ${width}px, 100vw`;
    // Image is always the same width, whatever the size of the screen
    case `fixed`:
      return `${width}px`;
    // Image is always the width of the screen
    case `fullWidth`:
      return `100vw`;
    default:
      return void 0;
  }
};
var pixelate = (value) => value || value === 0 ? `${value}px` : void 0;
var getStyle = ({
  width,
  height,
  aspectRatio,
  layout,
  objectFit = "cover",
  background
}) => {
  const styleEntries = [
    ["object-fit", objectFit]
  ];
  if (background?.startsWith("https:") || background?.startsWith("http:") || background?.startsWith("data:") || background?.startsWith("/")) {
    styleEntries.push(["background-image", `url(${background})`]);
    styleEntries.push(["background-size", "cover"]);
    styleEntries.push(["background-repeat", "no-repeat"]);
  } else {
    styleEntries.push(["background", background]);
  }
  if (layout === "fixed") {
    styleEntries.push(["width", pixelate(width)]);
    styleEntries.push(["height", pixelate(height)]);
  }
  if (layout === "constrained") {
    styleEntries.push(["max-width", pixelate(width)]);
    styleEntries.push(["max-height", pixelate(height)]);
    styleEntries.push([
      "aspect-ratio",
      aspectRatio ? `${aspectRatio}` : void 0
    ]);
    styleEntries.push(["width", "100%"]);
  }
  if (layout === "fullWidth") {
    styleEntries.push(["width", "100%"]);
    styleEntries.push([
      "aspect-ratio",
      aspectRatio ? `${aspectRatio}` : void 0
    ]);
    styleEntries.push(["height", pixelate(height)]);
  }
  return Object.fromEntries(
    styleEntries.filter(([, value]) => value)
  );
};
var DEFAULT_RESOLUTIONS = [
  6016,
  // 6K
  5120,
  // 5K
  4480,
  // 4.5K
  3840,
  // 4K
  3200,
  // QHD+
  2560,
  // WQXGA
  2048,
  // QXGA
  1920,
  // 1080p
  1668,
  // Various iPads
  1280,
  // 720p
  1080,
  // iPhone 6-8 Plus
  960,
  // older horizontal phones
  828,
  // iPhone XR/11
  750,
  // iPhone 6-8
  640
  // older and lower-end phones
];
var LOW_RES_WIDTH = 24;
var getBreakpoints = ({
  width,
  layout,
  resolutions = DEFAULT_RESOLUTIONS
}) => {
  if (layout === "fullWidth") {
    return resolutions;
  }
  if (!width) {
    return [];
  }
  const doubleWidth = width * 2;
  if (layout === "fixed") {
    return [width, doubleWidth];
  }
  if (layout === "constrained") {
    return [
      // Always include the image at 1x and 2x the specified width
      width,
      doubleWidth,
      // Filter out any resolutions that are larger than the double-res image
      ...resolutions.filter((w) => w < doubleWidth)
    ];
  }
  return [];
};
var getSrcSetEntries = ({
  src: src2,
  width,
  layout = "constrained",
  height,
  aspectRatio,
  breakpoints,
  format
}) => {
  breakpoints ||= getBreakpoints({ width, layout });
  return breakpoints.sort((a, b) => a - b).map((bp) => {
    let transformedHeight;
    if (height && aspectRatio) {
      transformedHeight = Math.round(bp / aspectRatio);
    }
    return {
      url: src2,
      width: bp,
      height: transformedHeight,
      format
    };
  });
};
var getSrcSet = (options) => {
  let { src: src2, transformer, operations } = options;
  if (!transformer) {
    return "";
  }
  return getSrcSetEntries(options).map(({ url: _, ...transform2 }) => {
    const url = transformer(
      src2,
      { ...operations, ...transform2 },
      options.options
    );
    return `${url?.toString()} ${transform2.width}w`;
  }).join(",\n");
};
function transformSharedProps({
  width,
  height,
  priority,
  layout = "constrained",
  aspectRatio,
  ...props
}) {
  width = width && Number(width) || void 0;
  height = height && Number(height) || void 0;
  if (priority) {
    props.loading ||= "eager";
    props.fetchpriority ||= "high";
  } else {
    props.loading ||= "lazy";
    props.decoding ||= "async";
  }
  if (props.alt === "") {
    props.role ||= "presentation";
  }
  if (aspectRatio) {
    if (width) {
      if (height) ;
      else {
        height = Math.round(width / aspectRatio);
      }
    } else if (height) {
      width = Math.round(height * aspectRatio);
    } else ;
  } else if (width && height) {
    aspectRatio = width / height;
  } else ;
  return {
    width,
    height,
    aspectRatio,
    layout,
    ...props
  };
}
function transformBaseImageProps(props) {
  let {
    src: src2,
    transformer,
    background,
    layout,
    objectFit,
    breakpoints,
    width,
    height,
    aspectRatio,
    unstyled,
    operations,
    options,
    ...transformedProps
  } = transformSharedProps(props);
  if (transformer && background === "auto") {
    const lowResHeight = aspectRatio ? Math.round(LOW_RES_WIDTH / aspectRatio) : void 0;
    const lowResImage = transformer(
      src2,
      {
        width: LOW_RES_WIDTH,
        height: lowResHeight
      },
      options
    );
    if (lowResImage) {
      background = lowResImage.toString();
    }
  }
  const styleProps = {
    width,
    height,
    aspectRatio,
    layout,
    objectFit,
    background
  };
  transformedProps.sizes ||= getSizes(width, layout);
  if (!unstyled) {
    transformedProps.style = {
      ...getStyle(styleProps),
      ...transformedProps.style
    };
  }
  if (transformer) {
    transformedProps.srcset = getSrcSet({
      src: src2,
      width,
      height,
      aspectRatio,
      layout,
      breakpoints,
      transformer,
      operations,
      options
    });
    const transformed = transformer(
      src2,
      { ...operations, width, height },
      options
    );
    if (transformed) {
      src2 = transformed;
    }
    if (layout === "fullWidth" || layout === "constrained") {
      width = void 0;
      height = void 0;
    }
  }
  return {
    ...transformedProps,
    src: src2?.toString(),
    width,
    height
  };
}
function normalizeImageType(type) {
  if (!type) {
    return {};
  }
  if (type.startsWith("image/")) {
    return {
      format: type.slice(6),
      mimeType: type
    };
  }
  return {
    format: type,
    mimeType: `image/${type === "jpg" ? "jpeg" : type}`
  };
}
function transformBaseSourceProps({
  media,
  type,
  ...props
}) {
  let {
    src: src2,
    transformer,
    layout,
    breakpoints,
    width,
    height,
    aspectRatio,
    sizes,
    loading,
    decoding,
    operations,
    options,
    ...rest
  } = transformSharedProps(props);
  if (!transformer) {
    return {};
  }
  const { format, mimeType } = normalizeImageType(type);
  sizes ||= getSizes(width, layout);
  const srcset = getSrcSet({
    src: src2,
    width,
    height,
    aspectRatio,
    layout,
    breakpoints,
    transformer,
    format,
    operations,
    options
  });
  const transformed = transformer(
    src2,
    { ...operations, width, height },
    options
  );
  if (transformed) {
    src2 = transformed;
  }
  const returnObject = {
    ...rest,
    sizes,
    srcset
  };
  if (media) {
    returnObject.media = media;
  }
  if (mimeType) {
    returnObject.type = mimeType;
  }
  return returnObject;
}
const domains = {
  "images.ctfassets.net": "contentful",
  "cdn.builder.io": "builder.io",
  "images.prismic.io": "imgix",
  "www.datocms-assets.com": "imgix",
  "cdn.sanity.io": "imgix",
  "images.unsplash.com": "imgix",
  "cdn.shopify.com": "shopify",
  "s7d1.scene7.com": "scene7",
  "ip.keycdn.com": "keycdn",
  "assets.caisy.io": "bunny",
  "images.contentstack.io": "contentstack",
  "ucarecdn.com": "uploadcare",
  "imagedelivery.net": "cloudflare_images",
  "wsrv.nl": "wsrv"
};
const subdomains = {
  "imgix.net": "imgix",
  "wp.com": "wordpress",
  "files.wordpress.com": "wordpress",
  "b-cdn.net": "bunny",
  "storyblok.com": "storyblok",
  "kc-usercontent.com": "kontent.ai",
  "cloudinary.com": "cloudinary",
  "kxcdn.com": "keycdn",
  "imgeng.in": "imageengine",
  "imagekit.io": "imagekit",
  "cloudimg.io": "cloudimage",
  "ucarecdn.com": "uploadcare",
  "supabase.co": "supabase",
  "graphassets.com": "hygraph"
};
const paths = {
  "/cdn-cgi/image/": "cloudflare",
  "/cdn-cgi/imagedelivery/": "cloudflare_images",
  "/_next/image": "nextjs",
  "/_vercel/image": "vercel",
  "/is/image": "scene7",
  "/_ipx/": "ipx",
  "/_image": "astro",
  "/.netlify/images": "netlify",
  "/storage/v1/object/public/": "supabase",
  "/storage/v1/render/image/public/": "supabase",
  "/v1/storage/buckets/": "appwrite"
};
function roundIfNumeric(value) {
  if (!value) {
    return value;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return value;
  }
  return Math.round(num);
}
const toRelativeUrl = (url) => {
  const { pathname, search } = url;
  return `${pathname}${search}`;
};
const toCanonicalUrlString = (url) => {
  return url.hostname === "n" ? toRelativeUrl(url) : url.toString();
};
const toUrl = (url, base) => {
  return typeof url === "string" ? new URL(url, "http://n/") : url;
};
const escapeChar = (text) => text === " " ? "+" : "%" + text.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
const stripLeadingSlash = (str) => str?.startsWith("/") ? str.slice(1) : str;
const stripTrailingSlash = (str) => str?.endsWith("/") ? str.slice(0, -1) : str;
const addTrailingSlash = (str) => str?.endsWith("/") ? str : `${str}/`;
const createFormatter = (kvSeparator, paramSeparator) => {
  const encodedValueJoiner = escapeChar(kvSeparator);
  const encodedOperationJoiner = escapeChar(paramSeparator);
  function escape(value) {
    return encodeURIComponent(value).replaceAll(kvSeparator, encodedValueJoiner).replaceAll(paramSeparator, encodedOperationJoiner);
  }
  function format(key, value) {
    return `${escape(key)}${kvSeparator}${escape(String(value))}`;
  }
  return (operations) => {
    const ops = Array.isArray(operations) ? operations : Object.entries(operations);
    return ops.flatMap(([key, value]) => {
      if (value === void 0 || value === null) {
        return [];
      }
      if (Array.isArray(value)) {
        return value.map((v) => format(key, v));
      }
      return format(key, value);
    }).join(paramSeparator);
  };
};
const createParser = (kvSeparator, paramSeparator) => {
  if (kvSeparator === "=" && paramSeparator === "&") {
    return queryParser;
  }
  return (url) => {
    const urlString = url.toString();
    return Object.fromEntries(urlString.split(paramSeparator).map((pair) => {
      const [key, value] = pair.split(kvSeparator);
      return [decodeURI(key), decodeURI(value)];
    }));
  };
};
function clampDimensions(operations, maxWidth = 4e3, maxHeight = 4e3) {
  let { width, height } = operations;
  width = Number(width) || void 0;
  height = Number(height) || void 0;
  if (width && width > maxWidth) {
    if (height) {
      height = Math.round(height * maxWidth / width);
    }
    width = maxWidth;
  }
  if (height && height > maxHeight) {
    if (width) {
      width = Math.round(width * maxHeight / height);
    }
    height = maxHeight;
  }
  return { width, height };
}
function extractFromURL(url) {
  const parsedUrl = toUrl(url);
  const operations = Object.fromEntries(parsedUrl.searchParams.entries());
  for (const key in ["width", "height", "quality"]) {
    const value = operations[key];
    if (value) {
      const newVal = Number(value);
      if (!isNaN(newVal)) {
        operations[key] = newVal;
      }
    }
  }
  parsedUrl.search = "";
  return {
    operations,
    src: toCanonicalUrlString(parsedUrl)
  };
}
function normaliseOperations({ keyMap = {}, formatMap = {}, defaults = {} }, operations) {
  if (operations.format && operations.format in formatMap) {
    operations.format = formatMap[operations.format];
  }
  if (operations.width) {
    operations.width = roundIfNumeric(operations.width);
  }
  if (operations.height) {
    operations.height = roundIfNumeric(operations.height);
  }
  for (const k in keyMap) {
    if (!Object.prototype.hasOwnProperty.call(keyMap, k)) {
      continue;
    }
    const key = k;
    if (keyMap[key] === false) {
      delete operations[key];
      continue;
    }
    if (keyMap[key] && operations[key]) {
      operations[keyMap[key]] = operations[key];
      delete operations[key];
    }
  }
  for (const k in defaults) {
    if (!Object.prototype.hasOwnProperty.call(defaults, k)) {
      continue;
    }
    const key = k;
    const value = defaults[key];
    if (!operations[key] && value !== void 0) {
      if (keyMap[key] === false) {
        continue;
      }
      const resolvedKey = keyMap[key] ?? key;
      if (resolvedKey in operations) {
        continue;
      }
      operations[resolvedKey] = value;
    }
  }
  return operations;
}
const invertMap = (map2) => Object.fromEntries(Object.entries(map2).map(([k, v]) => [v, k]));
function denormaliseOperations({ keyMap = {}, formatMap = {}, defaults = {} }, operations) {
  const invertedKeyMap = invertMap(keyMap);
  const invertedFormatMap = invertMap(formatMap);
  const ops = normaliseOperations({
    keyMap: invertedKeyMap,
    formatMap: invertedFormatMap,
    defaults
  }, operations);
  if (ops.width) {
    ops.width = roundIfNumeric(ops.width);
  }
  if (ops.height) {
    ops.height = roundIfNumeric(ops.height);
  }
  const q = Number(ops.quality);
  if (!isNaN(q)) {
    ops.quality = q;
  }
  return ops;
}
const queryParser = (url) => {
  const parsedUrl = toUrl(url);
  return Object.fromEntries(parsedUrl.searchParams.entries());
};
function createOperationsGenerator({ kvSeparator = "=", paramSeparator = "&", ...options } = {}) {
  const formatter = createFormatter(kvSeparator, paramSeparator);
  return (operations) => {
    const normalisedOperations = normaliseOperations(options, operations);
    return formatter(normalisedOperations);
  };
}
function createOperationsParser({ kvSeparator = "=", paramSeparator = "&", defaults: _, ...options } = {}) {
  const parser = createParser(kvSeparator, paramSeparator);
  return (url) => {
    const operations = url ? parser(url) : {};
    return denormaliseOperations(options, operations);
  };
}
function createOperationsHandlers(config) {
  const operationsGenerator2 = createOperationsGenerator(config);
  const operationsParser2 = createOperationsParser(config);
  return { operationsGenerator: operationsGenerator2, operationsParser: operationsParser2 };
}
function paramToBoolean(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  try {
    return Boolean(JSON.parse(value?.toString()));
  } catch {
    return Boolean(value);
  }
}
const removeUndefined = (obj) => Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== void 0));
function createExtractAndGenerate(extract2, generate2) {
  return ((src2, operations, options) => {
    const base = extract2(src2, options);
    if (!base) {
      return generate2(src2, operations, options);
    }
    return generate2(base.src, {
      ...base.operations,
      ...removeUndefined(operations)
    }, {
      // deno-lint-ignore no-explicit-any
      ...base.options,
      ...options
    });
  });
}
const cdnDomains = new Map(Object.entries(domains));
const cdnSubdomains = Object.entries(subdomains);
const cdnPaths = Object.entries(paths);
function getProviderForUrl(url) {
  return getProviderForUrlByDomain(url) || getProviderForUrlByPath(url);
}
function getProviderForUrlByDomain(url) {
  if (typeof url === "string" && !url.startsWith("https://")) {
    return false;
  }
  const { hostname } = toUrl(url);
  const cdn = cdnDomains.get(hostname);
  if (cdn) {
    return cdn;
  }
  return cdnSubdomains.find(([subdomain]) => hostname.endsWith(subdomain))?.[1] || false;
}
function getProviderForUrlByPath(url) {
  const { pathname } = toUrl(url);
  return cdnPaths.find(([path]) => pathname.startsWith(path))?.[1] || false;
}
const VIEW_URL_SUFFIX = "/view?";
const PREVIEW_URL_SUFFIX = "/preview?";
const { operationsGenerator: operationsGenerator$o, operationsParser: operationsParser$j } = createOperationsHandlers({
  keyMap: {
    format: "output"
  },
  kvSeparator: "=",
  paramSeparator: "&"
});
const generate$q = (src2, modifiers) => {
  const url = toUrl(src2.toString().replace(VIEW_URL_SUFFIX, PREVIEW_URL_SUFFIX));
  const projectParam = url.searchParams.get("project") ?? "";
  const operations = operationsGenerator$o(modifiers);
  url.search = operations;
  url.searchParams.append("project", projectParam);
  return toCanonicalUrlString(url);
};
const extract$q = (url) => {
  if (getProviderForUrlByPath(url) !== "appwrite") {
    return null;
  }
  const parsedUrl = toUrl(url);
  const operations = operationsParser$j(parsedUrl);
  delete operations.project;
  const projectParam = parsedUrl.searchParams.get("project") ?? "";
  parsedUrl.search = "";
  parsedUrl.searchParams.append("project", projectParam);
  const sourceUrl = parsedUrl.href;
  return {
    src: sourceUrl,
    operations
  };
};
const transform$r = createExtractAndGenerate(extract$q, generate$q);
const DEFAULT_ENDPOINT = "/_image";
const { operationsParser: operationsParser$i, operationsGenerator: operationsGenerator$n } = createOperationsHandlers({
  keyMap: {
    format: "f",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    fit: "cover"
  }
});
const generate$p = (src2, modifiers, options) => {
  const url = toUrl(`${stripTrailingSlash(options?.baseUrl ?? "")}${options?.endpoint ?? DEFAULT_ENDPOINT}`);
  const operations = operationsGenerator$n(modifiers);
  url.search = operations;
  url.searchParams.set("href", src2.toString());
  return toCanonicalUrlString(url);
};
const extract$p = (url) => {
  const parsedUrl = toUrl(url);
  const src2 = parsedUrl.searchParams.get("href");
  if (!src2) {
    return null;
  }
  parsedUrl.searchParams.delete("href");
  const operations = operationsParser$i(parsedUrl);
  return {
    src: src2,
    operations,
    options: { baseUrl: parsedUrl.origin }
  };
};
const transform$q = (src2, operations, options = {}) => {
  const url = toUrl(src2);
  if (url.pathname !== (options?.endpoint ?? DEFAULT_ENDPOINT)) {
    return generate$p(src2, operations, options);
  }
  const base = extract$p(src2);
  if (!base) {
    return generate$p(src2, operations, options);
  }
  options.baseUrl ??= base.options.baseUrl;
  return generate$p(base.src, {
    ...base.operations,
    ...operations
  }, options);
};
const operationsGenerator$m = createOperationsGenerator({
  defaults: {
    fit: "cover",
    format: "webp",
    sharp: true
  }
});
const extract$o = extractFromURL;
const generate$o = (src2, modifiers) => {
  const operations = operationsGenerator$m(modifiers);
  const url = toUrl(src2);
  url.search = operations;
  return toCanonicalUrlString(url);
};
const transform$p = createExtractAndGenerate(extract$o, generate$o);
const operationsGenerator$l = createOperationsGenerator({
  keyMap: {
    format: "output"
  }
});
const extract$n = extractFromURL;
const generate$n = (src2, modifiers) => {
  const operations = operationsGenerator$l(modifiers);
  const url = toUrl(src2);
  url.search = operations;
  return toCanonicalUrlString(url);
};
const extractAndGenerate$1 = createExtractAndGenerate(extract$n, generate$n);
const transform$o = (src2, operations) => {
  const { width, height } = operations;
  if (width && height) {
    operations.aspect_ratio ??= `${Math.round(Number(width))}:${Math.round(Number(height))}`;
  }
  return extractAndGenerate$1(src2, operations);
};
const { operationsGenerator: operationsGenerator$k, operationsParser: operationsParser$h } = createOperationsHandlers({
  keyMap: {
    "format": "f"
  },
  defaults: {
    format: "auto",
    fit: "cover"
  },
  formatMap: {
    jpg: "jpeg"
  },
  kvSeparator: "=",
  paramSeparator: ","
});
const generate$m = (src2, operations, options) => {
  const modifiers = operationsGenerator$k(operations);
  const url = toUrl(options?.domain ? `https://${options.domain}` : "/");
  url.pathname = `/cdn-cgi/image/${modifiers}/${stripLeadingSlash(src2.toString())}`;
  return toCanonicalUrlString(url);
};
const extract$m = (url, options) => {
  if (getProviderForUrlByPath(url) !== "cloudflare") {
    return null;
  }
  const parsedUrl = toUrl(url);
  const [, , , modifiers, ...src2] = parsedUrl.pathname.split("/");
  const operations = operationsParser$h(modifiers);
  return {
    src: toCanonicalUrlString(toUrl(src2.join("/"))),
    operations,
    options: {
      domain: options?.domain ?? (parsedUrl.hostname === "n" ? void 0 : parsedUrl.hostname)
    }
  };
};
const transform$n = createExtractAndGenerate(extract$m, generate$m);
const cloudflareImagesRegex = /https?:\/\/(?<host>[^\/]+)\/cdn-cgi\/imagedelivery\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
const imagedeliveryRegex = /https?:\/\/(?<host>imagedelivery.net)\/(?<accountHash>[^\/]+)\/(?<imageId>[^\/]+)\/*(?<transformations>[^\/]+)*$/g;
const { operationsGenerator: operationsGenerator$j, operationsParser: operationsParser$g } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f"
  },
  defaults: {
    fit: "cover"
  },
  kvSeparator: "=",
  paramSeparator: ","
});
function formatUrl(options, transformations) {
  const { host, accountHash, imageId } = options;
  if (!host || !accountHash || !imageId) {
    throw new Error("Missing required Cloudflare Images options");
  }
  const pathSegments = [
    "https:/",
    ...host === "imagedelivery.net" ? [host] : [host, "cdn-cgi", "imagedelivery"],
    accountHash,
    imageId,
    transformations
  ].filter(Boolean);
  return pathSegments.join("/");
}
const generate$l = (_src, operations, options = {}) => {
  const transformations = operationsGenerator$j(operations);
  const url = formatUrl(options, transformations);
  return toCanonicalUrlString(toUrl(url));
};
const extract$l = (url) => {
  const parsedUrl = toUrl(url);
  const matches = [
    ...parsedUrl.toString().matchAll(cloudflareImagesRegex),
    ...parsedUrl.toString().matchAll(imagedeliveryRegex)
  ];
  if (!matches[0]?.groups) {
    return null;
  }
  const { host, accountHash, imageId, transformations } = matches[0].groups;
  const operations = operationsParser$g(transformations || "");
  const options = { host, accountHash, imageId };
  return {
    src: formatUrl(options),
    operations,
    options
  };
};
const transform$m = (src2, operations, options = {}) => {
  const extracted = extract$l(src2);
  if (!extracted) {
    throw new Error("Invalid Cloudflare Images URL");
  }
  const newOperations = { ...extracted.operations, ...operations };
  return generate$l(extracted.src, newOperations, {
    ...extracted.options,
    ...options
  });
};
const { operationsGenerator: operationsGenerator$i, operationsParser: operationsParser$f } = createOperationsHandlers({
  keyMap: {
    format: "force_format",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    org_if_sml: 1
  }
});
const generate$k = (src2, modifiers = {}, { token } = {}) => {
  if (!token) {
    throw new Error("Token is required for Cloudimage URLs" + src2);
  }
  let srcString = src2.toString();
  srcString = srcString.replace(/^https?:\/\//, "");
  if (srcString.includes("?")) {
    modifiers.ci_url_encoded = 1;
    srcString = encodeURIComponent(srcString);
  }
  const operations = operationsGenerator$i(modifiers);
  const url = new URL(`https://${token}.cloudimg.io/`);
  url.pathname = srcString;
  url.search = operations;
  return url.toString();
};
const extract$k = (src2, options = {}) => {
  const url = toUrl(src2);
  if (getProviderForUrl(url) !== "cloudimage") {
    return null;
  }
  const operations = operationsParser$f(url);
  let originalSrc = url.pathname;
  if (operations.ci_url_encoded) {
    originalSrc = decodeURIComponent(originalSrc);
    delete operations.ci_url_encoded;
  }
  options.token ??= url.hostname.replace(".cloudimg.io", "");
  return {
    src: `${url.protocol}/${originalSrc}`,
    operations,
    options
  };
};
const transform$l = createExtractAndGenerate(extract$k, generate$k);
const publicRegex = /https?:\/\/(?<host>res\.cloudinary\.com)\/(?<cloudName>[a-zA-Z0-9-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
const privateRegex = /https?:\/\/(?<host>(?<cloudName>[a-zA-Z0-9-]+)-res\.cloudinary\.com|[a-zA-Z0-9.-]+)\/(?<assetType>image|video|raw)\/(?<deliveryType>upload|fetch|private|authenticated|sprite|facebook|twitter|youtube|vimeo)\/?(?<signature>s\-\-[a-zA-Z0-9]+\-\-)?\/?(?<transformations>(?:[^_\/]+_[^,\/]+,?)*)?\/(?:(?<version>v\d+)\/)?(?<id>(?:[^\s\/]+\/)*[^\s\/]+(?:\.[a-zA-Z0-9]+)?)$/;
const { operationsGenerator: operationsGenerator$h, operationsParser: operationsParser$e } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f",
    quality: "q"
  },
  defaults: {
    format: "auto",
    c: "lfill"
  },
  kvSeparator: "_",
  paramSeparator: ","
});
function formatCloudinaryUrl({ host, cloudName, assetType, deliveryType, signature, transformations, version, id }) {
  const isPublic = host === "res.cloudinary.com";
  return [
    "https:/",
    host,
    isPublic ? cloudName : void 0,
    assetType,
    deliveryType,
    signature,
    transformations,
    version,
    id
  ].filter(Boolean).join("/");
}
function parseCloudinaryUrl(url) {
  let matches = url.toString().match(publicRegex);
  if (!matches?.length) {
    matches = url.toString().match(privateRegex);
  }
  if (!matches?.length) {
    return null;
  }
  return matches.groups || {};
}
const transform$k = (src2, operations) => {
  const group = parseCloudinaryUrl(src2.toString());
  if (!group) {
    return src2.toString();
  }
  const existing = operationsParser$e(group.transformations || "");
  group.transformations = operationsGenerator$h({
    ...existing,
    ...operations
  });
  return formatCloudinaryUrl(group);
};
const operationsGenerator$g = createOperationsGenerator({
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    fit: "fill"
  }
});
const generate$j = (src2, modifiers) => {
  const operations = operationsGenerator$g(modifiers);
  const url = new URL(src2);
  url.search = operations;
  return toCanonicalUrlString(url);
};
const extract$j = extractFromURL;
const extractAndGenerate = createExtractAndGenerate(extract$j, generate$j);
const transform$j = (src2, operations) => {
  const { width, height } = clampDimensions(operations, 4e3, 4e3);
  return extractAndGenerate(src2, {
    ...operations,
    width,
    height
  });
};
const operationsGenerator$f = createOperationsGenerator({
  defaults: {
    auto: "webp",
    disable: "upscale"
  }
});
const generate$i = (src2, operations, { baseURL = "https://images.contentstack.io/" } = {}) => {
  if (operations.width && operations.height) {
    operations.fit ??= "crop";
  }
  const modifiers = operationsGenerator$f(operations);
  const url = toUrl(src2);
  if (url.hostname === "n") {
    url.protocol = "https:";
    url.hostname = new URL(baseURL).hostname;
  }
  url.search = modifiers;
  return toCanonicalUrlString(url);
};
const extract$i = (url) => {
  const { src: src2, operations } = extractFromURL(url) ?? {};
  if (!operations || !src2) {
    return null;
  }
  const { origin } = toUrl(url);
  return {
    src: src2,
    operations,
    options: {
      baseURL: origin
    }
  };
};
const transform$i = createExtractAndGenerate(extract$i, generate$i);
const operationsGenerator$e = createOperationsGenerator({
  defaults: {
    withoutEnlargement: true,
    fit: "cover"
  }
});
const generate$h = (src2, operations) => {
  if (Array.isArray(operations.transforms)) {
    operations.transforms = JSON.stringify(operations.transforms);
  }
  const modifiers = operationsGenerator$e(operations);
  const url = toUrl(src2);
  url.search = modifiers;
  return toCanonicalUrlString(url);
};
const extract$h = (url) => {
  const base = extractFromURL(url);
  if (base?.operations?.transforms && typeof base.operations.transforms === "string") {
    try {
      base.operations.transforms = JSON.parse(base.operations.transforms);
    } catch {
      return null;
    }
  }
  return base;
};
const transform$h = createExtractAndGenerate(extract$h, generate$h);
const hygraphRegex = /https:\/\/(?<region>[a-z0-9-]+)\.graphassets\.com\/(?<envId>[a-zA-Z0-9]+)(?:\/(?<transformations>.*?))?\/(?<handle>[a-zA-Z0-9]+)$/;
createOperationsHandlers({
  keyMap: {
    width: "width",
    height: "height",
    format: "format"
  },
  defaults: {
    format: "auto",
    fit: "crop"
  }
});
const extract$g = (url) => {
  const parsedUrl = toUrl(url);
  const matches = parsedUrl.toString().match(hygraphRegex);
  if (!matches?.groups) {
    return null;
  }
  const { region, envId, handle, transformations } = matches.groups;
  const operations = {};
  if (transformations) {
    const parts = transformations.split("/");
    parts.forEach((part) => {
      const [operation, params] = part.split("=");
      if (operation === "resize" && params) {
        params.split(",").forEach((param) => {
          const [key, value] = param.split(":");
          if (key === "width" || key === "height") {
            operations[key] = Number(value);
          } else if (key === "fit") {
            operations.fit = value;
          }
        });
      } else if (operation === "output" && params) {
        params.split(",").forEach((param) => {
          const [key, value] = param.split(":");
          if (key === "format") {
            operations.format = value;
          }
        });
      } else if (operation === "auto_image") {
        operations.format = "auto";
      }
    });
  }
  return {
    src: `https://${region}.graphassets.com/${envId}/${handle}`,
    operations,
    options: {
      region,
      envId,
      handle
    }
  };
};
const generate$g = (src2, operations, options = {}) => {
  const extracted = extract$g(src2);
  if (!extracted) {
    throw new Error("Invalid Hygraph URL");
  }
  const { region, envId, handle } = {
    ...extracted.options,
    ...options
  };
  const transforms = [];
  if (operations.width || operations.height) {
    const resize = [];
    if (operations.width && operations.height) {
      resize.push("fit:crop");
    } else if (operations.fit) {
      resize.push(`fit:${operations.fit}`);
    }
    if (operations.width)
      resize.push(`width:${operations.width}`);
    if (operations.height)
      resize.push(`height:${operations.height}`);
    if (resize.length)
      transforms.push(`resize=${resize.join(",")}`);
  }
  if (operations.format === "auto" || !operations.format && !extracted.operations.format) {
    transforms.push("auto_image");
  } else if (operations.format) {
    transforms.push(`output=format:${operations.format}`);
  }
  const baseUrl = `https://${region}.graphassets.com/${envId}`;
  const transformPart = transforms.length > 0 ? "/" + transforms.join("/") : "";
  const finalUrl = toUrl(`${baseUrl}${transformPart}/${handle}`);
  return toCanonicalUrlString(finalUrl);
};
const transform$g = createExtractAndGenerate(extract$g, generate$g);
const { operationsGenerator: operationsGenerator$d, operationsParser: operationsParser$d } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f"
  },
  defaults: {
    m: "cropbox"
  },
  kvSeparator: "_",
  paramSeparator: "/"
});
const generate$f = (src2, operations) => {
  const modifiers = operationsGenerator$d(operations);
  const url = toUrl(src2);
  url.searchParams.set("imgeng", modifiers);
  return toCanonicalUrlString(url);
};
const extract$f = (url) => {
  const parsedUrl = toUrl(url);
  const imgeng = parsedUrl.searchParams.get("imgeng");
  if (!imgeng) {
    return null;
  }
  const operations = operationsParser$d(imgeng);
  parsedUrl.searchParams.delete("imgeng");
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$f = createExtractAndGenerate(extract$f, generate$f);
const { operationsGenerator: operationsGenerator$c, operationsParser: operationsParser$c } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "f",
    quality: "q"
  },
  defaults: {
    c: "maintain_ratio",
    fo: "auto"
  },
  kvSeparator: "-",
  paramSeparator: ","
});
const generate$e = (src2, operations) => {
  const modifiers = operationsGenerator$c(operations);
  const url = toUrl(src2);
  url.searchParams.set("tr", modifiers);
  return toCanonicalUrlString(url);
};
const extract$e = (url) => {
  const parsedUrl = toUrl(url);
  let trPart = null;
  let path = parsedUrl.pathname;
  if (parsedUrl.searchParams.has("tr")) {
    trPart = parsedUrl.searchParams.get("tr");
    parsedUrl.searchParams.delete("tr");
  } else {
    const pathParts = parsedUrl.pathname.split("/");
    const trIndex = pathParts.findIndex((part) => part.startsWith("tr:"));
    if (trIndex !== -1) {
      trPart = pathParts[trIndex].slice(3);
      path = pathParts.slice(0, trIndex).concat(pathParts.slice(trIndex + 1)).join("/");
    }
  }
  if (!trPart) {
    return null;
  }
  parsedUrl.pathname = path;
  const operations = operationsParser$c(trPart);
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$e = createExtractAndGenerate(extract$e, generate$e);
const { operationsGenerator: operationsGenerator$b, operationsParser: operationsParser$b } = createOperationsHandlers({
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  },
  defaults: {
    fit: "min",
    auto: "format"
  }
});
const extract$d = (url) => {
  const src2 = toUrl(url);
  const operations = operationsParser$b(url);
  src2.search = "";
  return { src: toCanonicalUrlString(src2), operations };
};
const generate$d = (src2, operations) => {
  const modifiers = operationsGenerator$b(operations);
  const url = toUrl(src2);
  url.search = modifiers;
  if (url.searchParams.has("fm") && url.searchParams.get("auto") === "format") {
    url.searchParams.delete("auto");
  }
  return toCanonicalUrlString(url);
};
const transform$d = createExtractAndGenerate(extract$d, generate$d);
const { operationsGenerator: operationsGenerator$a, operationsParser: operationsParser$a } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    quality: "q",
    format: "f"
  },
  defaults: {
    f: "auto"
  },
  kvSeparator: "_",
  paramSeparator: ","
});
const generate$c = (src2, operations, options) => {
  if (operations.width && operations.height) {
    operations.s = `${operations.width}x${operations.height}`;
    delete operations.width;
    delete operations.height;
  }
  const modifiers = operationsGenerator$a(operations);
  const baseURL = options?.baseURL ?? "/_ipx";
  const url = toUrl(baseURL);
  url.pathname = `${stripTrailingSlash(url.pathname)}/${modifiers}/${stripLeadingSlash(src2.toString())}`;
  return toCanonicalUrlString(url);
};
const extract$c = (url) => {
  const parsedUrl = toUrl(url);
  const [, baseUrlPart, modifiers, ...srcParts] = parsedUrl.pathname.split("/");
  if (!modifiers || !srcParts.length) {
    return null;
  }
  const operations = operationsParser$a(modifiers);
  if (operations.s) {
    const [width, height] = operations.s.split("x").map(Number);
    operations.width = width;
    operations.height = height;
    delete operations.s;
  }
  return {
    src: "/" + srcParts.join("/"),
    operations,
    options: {
      baseURL: `${parsedUrl.origin}/${baseUrlPart}`
    }
  };
};
const transform$c = (src2, operations, options) => {
  const url = toUrl(src2);
  const baseURL = options?.baseURL;
  if (baseURL && url.toString().startsWith(baseURL) || url.pathname.startsWith("/_ipx")) {
    const extracted = extract$c(src2);
    if (extracted) {
      return generate$c(extracted.src, { ...extracted.operations, ...operations }, { baseURL: extracted.options.baseURL });
    }
  }
  return generate$c(src2, operations, { baseURL });
};
const BOOLEAN_PARAMS = [
  "enlarge",
  "flip",
  "flop",
  "negate",
  "normalize",
  "grayscale",
  "removealpha",
  "olrepeat",
  "progressive",
  "adaptive",
  "lossless",
  "nearlossless",
  "metadata"
];
const { operationsGenerator: operationsGenerator$9, operationsParser: operationsParser$9 } = createOperationsHandlers({
  defaults: {
    fit: "cover"
  },
  formatMap: {
    jpg: "jpeg"
  }
});
const generate$b = (src2, operations) => {
  const url = toUrl(src2);
  for (const key of BOOLEAN_PARAMS) {
    if (operations[key] !== void 0) {
      operations[key] = operations[key] ? 1 : 0;
    }
  }
  url.search = operationsGenerator$9(operations);
  return toCanonicalUrlString(url);
};
const extract$b = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$9(parsedUrl);
  for (const key of BOOLEAN_PARAMS) {
    if (operations[key] !== void 0) {
      operations[key] = paramToBoolean(operations[key]);
    }
  }
  parsedUrl.search = "";
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$b = createExtractAndGenerate(extract$b, generate$b);
const { operationsGenerator: operationsGenerator$8, operationsParser: operationsParser$8 } = createOperationsHandlers({
  formatMap: {
    jpg: "jpeg"
  },
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  }
});
const generate$a = (src2, operations) => {
  const url = toUrl(src2);
  if (operations.lossless !== void 0) {
    operations.lossless = operations.lossless ? 1 : 0;
  }
  if (operations.width && operations.height) {
    operations.fit = "crop";
  }
  url.search = operationsGenerator$8(operations);
  return toCanonicalUrlString(url);
};
const extract$a = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$8(parsedUrl);
  if (operations.lossless !== void 0) {
    operations.lossless = paramToBoolean(operations.lossless);
  }
  parsedUrl.search = "";
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$a = createExtractAndGenerate(extract$a, generate$a);
const { operationsGenerator: operationsGenerator$7, operationsParser: operationsParser$7 } = createOperationsHandlers({
  defaults: {
    fit: "cover"
  },
  keyMap: {
    format: "fm",
    width: "w",
    height: "h",
    quality: "q"
  }
});
const generate$9 = (src2, operations, options = {}) => {
  const url = toUrl(`${options.baseUrl || ""}/.netlify/images`);
  url.search = operationsGenerator$7(operations);
  url.searchParams.set("url", src2.toString());
  return toCanonicalUrlString(url);
};
const extract$9 = (url) => {
  if (getProviderForUrlByPath(url) !== "netlify") {
    return null;
  }
  const parsedUrl = toUrl(url);
  const operations = operationsParser$7(parsedUrl);
  delete operations.url;
  const sourceUrl = parsedUrl.searchParams.get("url") || "";
  parsedUrl.search = "";
  return {
    src: sourceUrl,
    operations,
    options: {
      baseUrl: parsedUrl.hostname === "n" ? void 0 : parsedUrl.origin
    }
  };
};
const transform$9 = createExtractAndGenerate(extract$9, generate$9);
const { operationsGenerator: operationsGenerator$6, operationsParser: operationsParser$6 } = createOperationsHandlers({
  keyMap: {
    width: "w",
    quality: "q",
    height: false,
    format: false
  },
  defaults: {
    q: 75
  }
});
const generate$8 = (src2, operations, options = {}) => {
  const url = toUrl(`${options.baseUrl || ""}/${options.prefix || "_vercel"}/image`);
  url.search = operationsGenerator$6(operations);
  url.searchParams.append("url", src2.toString());
  return toCanonicalUrlString(url);
};
const extract$8 = (url, options = {}) => {
  if (!["vercel", "nextjs"].includes(getProviderForUrlByPath(url) || "")) {
    return null;
  }
  const parsedUrl = toUrl(url);
  const sourceUrl = parsedUrl.searchParams.get("url") || "";
  parsedUrl.searchParams.delete("url");
  const operations = operationsParser$6(parsedUrl);
  parsedUrl.search = "";
  return {
    src: sourceUrl,
    operations,
    options: {
      baseUrl: options.baseUrl ?? parsedUrl.origin
    }
  };
};
const transform$8 = createExtractAndGenerate(extract$8, generate$8);
const generate$7 = (src2, operations, options = {}) => generate$8(src2, operations, { ...options, prefix: "_next" });
const extract$7 = (url, options) => extract$8(url, options);
const transform$7 = createExtractAndGenerate(extract$7, generate$7);
const { operationsGenerator: operationsGenerator$5, operationsParser: operationsParser$5 } = createOperationsHandlers({
  keyMap: {
    width: "wid",
    height: "hei",
    quality: "qlt",
    format: "fmt"
  },
  defaults: {
    fit: "crop,0"
  }
});
const BASE = "https://s7d1.scene7.com/is/image/";
const generate$6 = (src2, operations) => {
  const url = new URL(src2, BASE);
  url.search = operationsGenerator$5(operations);
  return toCanonicalUrlString(url);
};
const extract$6 = (url) => {
  if (getProviderForUrl(url) !== "scene7") {
    return null;
  }
  const parsedUrl = new URL(url, BASE);
  const operations = operationsParser$5(parsedUrl);
  parsedUrl.search = "";
  return {
    src: parsedUrl.toString(),
    operations
  };
};
const transform$6 = createExtractAndGenerate(extract$6, generate$6);
const shopifyRegex = /(.+?)(?:_(?:(pico|icon|thumb|small|compact|medium|large|grande|original|master)|(\d*)x(\d*)))?(?:_crop_([a-z]+))?(\.[a-zA-Z]+)(\.png|\.jpg|\.webp|\.avif)?$/;
const { operationsGenerator: operationsGenerator$4, operationsParser: operationsParser$4 } = createOperationsHandlers({
  keyMap: {
    format: false
  }
});
const generate$5 = (src2, operations) => {
  const url = toUrl(src2);
  const basePath = url.pathname.replace(shopifyRegex, "$1$6");
  url.pathname = basePath;
  url.search = operationsGenerator$4(operations);
  return toCanonicalUrlString(url);
};
const extract$5 = (url) => {
  const parsedUrl = toUrl(url);
  const match = shopifyRegex.exec(parsedUrl.pathname);
  const operations = operationsParser$4(parsedUrl);
  if (match) {
    const [, , , width, height, crop] = match;
    if (width && height && !operations.width && !operations.height) {
      operations.width = parseInt(width, 10);
      operations.height = parseInt(height, 10);
    }
    if (crop) {
      operations.crop ??= crop;
    }
  }
  const basePath = parsedUrl.pathname.replace(shopifyRegex, "$1$6");
  parsedUrl.pathname = basePath;
  for (const key of ["width", "height", "crop", "pad_color", "format"]) {
    parsedUrl.searchParams.delete(key);
  }
  return {
    src: parsedUrl.toString(),
    operations
  };
};
const transform$5 = createExtractAndGenerate(extract$5, generate$5);
const storyBlokAssets = /(?<id>\/f\/\d+\/\d+x\d+\/\w+\/[^\/]+)\/?(?<modifiers>m\/?(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?)?$/;
const storyBlokImg2 = /^(?<modifiers>\/(?<crop>\d+x\d+:\d+x\d+)?\/?(?<resize>(?<flipx>\-)?(?<width>\d+)x(?<flipy>\-)?(?<height>\d+))?\/?(filters\:(?<filters>[^\/]+))?\/?)?(?<id>\/f\/.+)$/;
const filterSplitterRegex = /:(?![^(]*\))/;
const splitFilters = (filters) => {
  if (!filters) {
    return {};
  }
  return Object.fromEntries(filters.split(filterSplitterRegex).map((filter2) => {
    if (!filter2)
      return [];
    const [key, value] = filter2.split("(");
    return [key, value.replace(")", "")];
  }));
};
const generateFilters = (filters) => {
  if (!filters) {
    return void 0;
  }
  const filterItems = Object.entries(filters).map(([key, value]) => `${key}(${value ?? ""})`);
  if (filterItems.length === 0) {
    return void 0;
  }
  return `filters:${filterItems.join(":")}`;
};
const extract$4 = (url) => {
  const parsedUrl = toUrl(url);
  const regex = parsedUrl.hostname === "img2.storyblok.com" ? storyBlokImg2 : storyBlokAssets;
  const matches = regex.exec(parsedUrl.pathname);
  if (!matches || !matches.groups) {
    return null;
  }
  const { id, crop, width, height, filters, flipx, flipy } = matches.groups;
  const { format, ...filterMap } = splitFilters(filters ?? "");
  if (parsedUrl.hostname === "img2.storyblok.com") {
    parsedUrl.hostname = "a.storyblok.com";
  }
  const operations = Object.fromEntries([
    ["width", Number(width) || void 0],
    ["height", Number(height) || void 0],
    ["format", format],
    ["crop", crop],
    ["filters", filterMap],
    ["flipx", flipx],
    ["flipy", flipy]
  ].filter(([_, value]) => value !== void 0));
  return {
    src: `${parsedUrl.origin}${id}`,
    operations
  };
};
const generate$4 = (src2, operations) => {
  const url = toUrl(src2);
  const { width = 0, height = 0, format, crop, filters = {}, flipx = "", flipy = "" } = operations;
  const size = `${flipx}${width}x${flipy}${height}`;
  if (format) {
    filters.format = format;
  }
  const parts = [
    url.pathname,
    "m",
    crop,
    size,
    generateFilters(filters)
  ].filter(Boolean);
  url.pathname = parts.join("/");
  return toCanonicalUrlString(url);
};
const transform$4 = createExtractAndGenerate(extract$4, generate$4);
const STORAGE_URL_PREFIX = "/storage/v1/object/public/";
const RENDER_URL_PREFIX = "/storage/v1/render/image/public/";
const isRenderUrl = (url) => url.pathname.startsWith(RENDER_URL_PREFIX);
const { operationsGenerator: operationsGenerator$3, operationsParser: operationsParser$3 } = createOperationsHandlers({});
const generate$3 = (src2, operations) => {
  const url = toUrl(src2);
  const basePath = url.pathname.replace(RENDER_URL_PREFIX, STORAGE_URL_PREFIX);
  url.pathname = basePath;
  if (operations.format && operations.format !== "origin") {
    delete operations.format;
  }
  url.search = operationsGenerator$3(operations);
  return toCanonicalUrlString(url).replace(STORAGE_URL_PREFIX, RENDER_URL_PREFIX);
};
const extract$3 = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$3(parsedUrl);
  const isRender = isRenderUrl(parsedUrl);
  const imagePath = parsedUrl.pathname.replace(RENDER_URL_PREFIX, "").replace(STORAGE_URL_PREFIX, "");
  if (!isRender) {
    return {
      src: toCanonicalUrlString(parsedUrl),
      operations
    };
  }
  return {
    src: `${parsedUrl.origin}${STORAGE_URL_PREFIX}${imagePath}`,
    operations
  };
};
const transform$3 = createExtractAndGenerate(extract$3, generate$3);
const uploadcareRegex = /^https?:\/\/(?<host>[^\/]+)\/(?<uuid>[^\/]+)(?:\/(?<filename>[^\/]+)?)?/;
const { operationsGenerator: operationsGenerator$2, operationsParser: operationsParser$2 } = createOperationsHandlers({
  keyMap: {
    width: false,
    height: false
  },
  defaults: {
    format: "auto"
  },
  kvSeparator: "/",
  paramSeparator: "/-/"
});
const extract$2 = (url) => {
  const parsedUrl = toUrl(url);
  const match = uploadcareRegex.exec(parsedUrl.toString());
  if (!match || !match.groups) {
    return null;
  }
  const { host, uuid } = match.groups;
  const [, ...operationsString] = parsedUrl.pathname.split("/-/");
  const operations = operationsParser$2(operationsString.join("/-/") || "");
  if (operations.resize) {
    const [width, height] = operations.resize.split("x");
    if (width)
      operations.width = parseInt(width);
    if (height)
      operations.height = parseInt(height);
    delete operations.resize;
  }
  return {
    src: `https://${host}/${uuid}/`,
    operations,
    options: { host }
  };
};
const generate$2 = (src2, operations, options = {}) => {
  const url = toUrl(src2);
  const host = options.host || url.hostname;
  const match = uploadcareRegex.exec(url.toString());
  if (match?.groups) {
    url.pathname = `/${match.groups.uuid}/`;
  }
  operations.resize = operations.resize || `${operations.width ?? ""}x${operations.height ?? ""}`;
  delete operations.width;
  delete operations.height;
  const modifiers = addTrailingSlash(operationsGenerator$2(operations));
  url.hostname = host;
  url.pathname = stripTrailingSlash(url.pathname) + (modifiers ? `/-/${modifiers}` : "") + (match?.groups?.filename ?? "");
  return toCanonicalUrlString(url);
};
const transform$2 = createExtractAndGenerate(extract$2, generate$2);
const { operationsGenerator: operationsGenerator$1, operationsParser: operationsParser$1 } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h"
  },
  defaults: {
    crop: "1"
  }
});
const generate$1 = (src2, operations) => {
  const url = toUrl(src2);
  const { crop } = operations;
  if (typeof crop !== "undefined" && crop !== "0") {
    operations.crop = crop ? "1" : "0";
  }
  url.search = operationsGenerator$1(operations);
  return toCanonicalUrlString(url);
};
const extract$1 = (url) => {
  const parsedUrl = toUrl(url);
  const operations = operationsParser$1(parsedUrl);
  if (operations.crop !== void 0) {
    operations.crop = operations.crop === "1";
  }
  parsedUrl.search = "";
  return {
    src: toCanonicalUrlString(parsedUrl),
    operations
  };
};
const transform$1 = createExtractAndGenerate(extract$1, generate$1);
const { operationsGenerator, operationsParser } = createOperationsHandlers({
  keyMap: {
    width: "w",
    height: "h",
    format: "output",
    quality: "q"
  },
  defaults: {
    fit: "cover"
  }
});
const extract = (url) => {
  const urlObj = toUrl(url);
  const srcParam = urlObj.searchParams.get("url");
  if (!srcParam) {
    return null;
  }
  let src2 = srcParam;
  if (!src2.startsWith("http://") && !src2.startsWith("https://")) {
    src2 = "https://" + src2;
  }
  urlObj.searchParams.delete("url");
  const operations = operationsParser(urlObj);
  return {
    src: src2,
    operations
  };
};
const generate = (src2, operations) => {
  const url = new URL("https://wsrv.nl/");
  const srcUrl = typeof src2 === "string" ? src2 : src2.toString();
  const cleanSrc = srcUrl.replace(/^https?:\/\//, "");
  url.searchParams.set("url", cleanSrc);
  const params = operationsGenerator(operations);
  const searchParams = new URLSearchParams(params);
  for (const [key, value] of searchParams) {
    if (key !== "url") {
      url.searchParams.set(key, value);
    }
  }
  return toCanonicalUrlString(url);
};
const transform = createExtractAndGenerate(extract, generate);
const transformerMap = {
  appwrite: transform$r,
  astro: transform$q,
  "builder.io": transform$p,
  bunny: transform$o,
  cloudflare: transform$n,
  cloudflare_images: transform$m,
  cloudimage: transform$l,
  cloudinary: transform$k,
  contentful: transform$j,
  contentstack: transform$i,
  directus: transform$h,
  hygraph: transform$g,
  imageengine: transform$f,
  imagekit: transform$e,
  imgix: transform$d,
  ipx: transform$c,
  keycdn: transform$b,
  "kontent.ai": transform$a,
  netlify: transform$9,
  nextjs: transform$7,
  scene7: transform$6,
  shopify: transform$5,
  storyblok: transform$4,
  supabase: transform$3,
  uploadcare: transform$2,
  vercel: transform$8,
  wordpress: transform$1,
  wsrv: transform
};
function getTransformerForCdn(cdn) {
  if (!cdn) {
    return void 0;
  }
  return transformerMap[cdn];
}
function transformProps({
  cdn,
  fallback,
  operations = {},
  options,
  ...props
}) {
  cdn ??= getProviderForUrl(props.src) || fallback;
  if (!cdn) {
    return props;
  }
  const transformer = getTransformerForCdn(cdn);
  if (!transformer) {
    return props;
  }
  return transformBaseImageProps({
    ...props,
    operations: operations?.[cdn],
    options: options?.[cdn],
    transformer
  });
}
function transformSourceProps({
  cdn,
  fallback,
  operations,
  options,
  ...props
}) {
  cdn ??= getProviderForUrl(props.src) || fallback;
  if (!cdn) {
    return props;
  }
  const transformer = getTransformerForCdn(cdn);
  if (!transformer) {
    return props;
  }
  return transformBaseSourceProps({
    ...props,
    operations: operations?.[cdn],
    options: options?.[cdn],
    transformer
  });
}
var Image$1 = reactExports.forwardRef(
  function Image2(props, ref) {
    const camelizedProps = camelizeProps(
      transformProps(props)
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { ...camelizedProps, ref });
  }
);
reactExports.forwardRef(
  function Source2(props, ref) {
    const camelizedProps = camelizeProps(
      transformSourceProps(
        props
      )
    );
    return /* @__PURE__ */ jsxRuntimeExports.jsx("source", { ...camelizedProps, ref });
  }
);
const mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();
const toKebabCase = (string2) => string2.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const toCamelCase = (string2) => string2.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);
const toPascalCase = (string2) => {
  const camelCase = toCamelCase(string2);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};
const Icon = reactExports.forwardRef(
  ({
    color = "currentColor",
    size = 24,
    strokeWidth = 2,
    absoluteStrokeWidth,
    className = "",
    children,
    iconNode,
    ...rest
  }, ref) => reactExports.createElement(
    "svg",
    {
      ref,
      ...defaultAttributes,
      width: size,
      height: size,
      stroke: color,
      strokeWidth: absoluteStrokeWidth ? Number(strokeWidth) * 24 / Number(size) : strokeWidth,
      className: mergeClasses("lucide", className),
      ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
      ...rest
    },
    [
      ...iconNode.map(([tag, attrs]) => reactExports.createElement(tag, attrs)),
      ...Array.isArray(children) ? children : [children]
    ]
  )
);
const createLucideIcon = (iconName, iconNode) => {
  const Component = reactExports.forwardRef(
    ({ className, ...props }, ref) => reactExports.createElement(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};
const __iconNode$i = [
  [
    "path",
    {
      d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
      key: "18u6gg"
    }
  ],
  ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }]
];
const Camera = createLucideIcon("camera", __iconNode$i);
const __iconNode$h = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$h);
const __iconNode$g = [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]];
const ChevronLeft = createLucideIcon("chevron-left", __iconNode$g);
const __iconNode$f = [["path", { d: "m9 18 6-6-6-6", key: "mthhwq" }]];
const ChevronRight = createLucideIcon("chevron-right", __iconNode$f);
const __iconNode$e = [["path", { d: "m18 15-6-6-6 6", key: "153udz" }]];
const ChevronUp = createLucideIcon("chevron-up", __iconNode$e);
const __iconNode$d = [
  [
    "path",
    {
      d: "M13.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v11.5",
      key: "4pqfef"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M8 12v-1", key: "1ej8lb" }],
  ["path", { d: "M8 18v-2", key: "qcmpov" }],
  ["path", { d: "M8 7V6", key: "1nbb54" }],
  ["circle", { cx: "8", cy: "20", r: "2", key: "ckkr5m" }]
];
const FileArchive = createLucideIcon("file-archive", __iconNode$d);
const __iconNode$c = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 12.5 8 15l2 2.5", key: "1tg20x" }],
  ["path", { d: "m14 12.5 2 2.5-2 2.5", key: "yinavb" }]
];
const FileCode = createLucideIcon("file-code", __iconNode$c);
const __iconNode$b = [
  [
    "path",
    {
      d: "M4 6.835V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2h-.343",
      key: "1vfytu"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  [
    "path",
    {
      d: "M2 19a2 2 0 0 1 4 0v1a2 2 0 0 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 0 1-4 0v-1a2 2 0 0 1 4 0",
      key: "1etmh7"
    }
  ]
];
const FileHeadphone = createLucideIcon("file-headphone", __iconNode$b);
const __iconNode$a = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  [
    "path",
    {
      d: "M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z",
      key: "1tzo1f"
    }
  ]
];
const FilePlay = createLucideIcon("file-play", __iconNode$a);
const __iconNode$9 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M12 17h.01", key: "p32p05" }],
  ["path", { d: "M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3", key: "mhlwft" }]
];
const FileQuestionMark = createLucideIcon("file-question-mark", __iconNode$9);
const __iconNode$8 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  ["path", { d: "M10 9H8", key: "b1mrlr" }],
  ["path", { d: "M16 13H8", key: "t4e002" }],
  ["path", { d: "M16 17H8", key: "z1uh3a" }]
];
const FileText = createLucideIcon("file-text", __iconNode$8);
const __iconNode$7 = [
  [
    "path",
    {
      d: "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z",
      key: "1oefj6"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }]
];
const File$1 = createLucideIcon("file", __iconNode$7);
const __iconNode$6 = [
  [
    "path",
    {
      d: "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2",
      key: "usdka0"
    }
  ]
];
const FolderOpen = createLucideIcon("folder-open", __iconNode$6);
const __iconNode$5 = [
  ["line", { x1: "2", x2: "22", y1: "2", y2: "22", key: "a6p6uj" }],
  ["path", { d: "M10.41 10.41a2 2 0 1 1-2.83-2.83", key: "1bzlo9" }],
  ["line", { x1: "13.5", x2: "6", y1: "13.5", y2: "21", key: "1q0aeu" }],
  ["line", { x1: "18", x2: "21", y1: "12", y2: "15", key: "5mozeu" }],
  [
    "path",
    {
      d: "M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59",
      key: "mmje98"
    }
  ],
  ["path", { d: "M21 15V5a2 2 0 0 0-2-2H9", key: "43el77" }]
];
const ImageOff = createLucideIcon("image-off", __iconNode$5);
const __iconNode$4 = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2", key: "1m3agn" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }]
];
const Image = createLucideIcon("image", __iconNode$4);
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 16v-4", key: "1dtifu" }],
  ["path", { d: "M12 8h.01", key: "e9boi3" }]
];
const Info = createLucideIcon("info", __iconNode$3);
const __iconNode$2 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Settings = createLucideIcon("settings", __iconNode$2);
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M12 2v2", key: "tus03m" }],
  ["path", { d: "M12 20v2", key: "1lh1kg" }],
  ["path", { d: "m4.93 4.93 1.41 1.41", key: "149t6j" }],
  ["path", { d: "m17.66 17.66 1.41 1.41", key: "ptbguv" }],
  ["path", { d: "M2 12h2", key: "1t8f8n" }],
  ["path", { d: "M20 12h2", key: "1q8mjw" }],
  ["path", { d: "m6.34 17.66-1.41 1.41", key: "1m8zz5" }],
  ["path", { d: "m19.07 4.93-1.41 1.41", key: "1shlcs" }]
];
const Sun = createLucideIcon("sun", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
function useElementSize(ref) {
  const [entries, setEntries] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!ref.current)
      return;
    const observer = new ResizeObserver((observedEntries) => {
      setEntries(observedEntries);
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return entries[0]?.contentRect ?? { width: 0, height: 0 };
}
const GalleryContext = reactExports.createContext(null);
function useGallery() {
  const context = reactExports.use(GalleryContext);
  if (!context) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}
function retryDelay(attemptIndex) {
  return Math.min(1e3 * 2 ** attemptIndex, 1e4);
}
const thumbnailShader = "/**\n * Thumbnail Shader\n *\n * Goal: High-quality image downscaling (generating thumbnails) from a larger source texture.\n *\n * Technique: Adaptive Supersampling / Box Filtering.\n * - Standard nearest-neighbor or bilinear sampling causes aliasing (shimmering/pixelation) when downscaling significantly.\n * - This shader dynamically calculates the pixel footprint (how many source texels cover one destination pixel).\n * - It samples the source texture multiple times (up to 16x16 samples) and averages the results.\n * - This acts as a Box Filter, effectively filtering out high-frequency noise and producing smooth, photography-grade thumbnails.\n */\n\nstruct VertexOutput {\n    @builtin(position) position: vec4f,\n    @location(0) uv: vec2f,\n}\n\nstruct Uniforms {\n    scale: vec2f,\n    offset: vec2f,\n}\n\n@group(0) @binding(2) var<uniform> uniforms: Uniforms;\n\n@vertex\nfn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {\n    var pos = array<vec2f, 4>(\n        vec2f(-1.0, -1.0),\n        vec2f( 1.0, -1.0),\n        vec2f(-1.0,  1.0),\n        vec2f( 1.0,  1.0)\n    );\n\n    var uvs = array<vec2f, 4>(\n        vec2f(0.0, 1.0),\n        vec2f(1.0, 1.0),\n        vec2f(0.0, 0.0),\n        vec2f(1.0, 0.0)\n    );\n\n    var output: VertexOutput;\n    output.position = vec4f(pos[vertexIndex], 0.0, 1.0);\n    output.uv = uvs[vertexIndex] * uniforms.scale + uniforms.offset;\n    return output;\n}\n\n@group(0) @binding(0) var mySampler: sampler;\n@group(0) @binding(1) var myTexture: texture_2d<f32>;\n\n@fragment\nfn fs_main(input: VertexOutput) -> @location(0) vec4f {\n    let texDim = vec2f(textureDimensions(myTexture));\n    let dUVdx = dpdx(input.uv);\n    let dUVdy = dpdy(input.uv);\n\n    // Estimate pixel footprint size in texels\n    let pixelScale = max(length(dUVdx * texDim), length(dUVdy * texDim));\n\n    // If downscaling significantly, use box sampling\n    // We limit max steps to avoid performance cliff on massive downscales\n    // 16 steps means 16x16 = 256 samples, which is heavy but acceptable for offline/one-off thumbnail gen.\n    // For real-time, we'd want mipmaps.\n    let steps = clamp(ceil(pixelScale), 1.0, 16.0);\n\n    if steps <= 1.0 {\n        return textureSampleLevel(myTexture, mySampler, input.uv, 0.0);\n    }\n\n    var color = vec4f(0.0);\n    var totalWeight = 0.0;\n\n    // Sample a grid within the pixel footprint\n    for (var x = 0.0; x < steps; x = x + 1.0) {\n        for (var y = 0.0; y < steps; y = y + 1.0) {\n            // Offset from 0 to 1 across the footprint\n            let offX = (x + 0.5) / steps - 0.5;\n            let offY = (y + 0.5) / steps - 0.5;\n\n            // Adjust UV based on derivatives\n            let sampleUV = input.uv + dUVdx * offX + dUVdy * offY;\n\n            color = color + textureSampleLevel(myTexture, mySampler, sampleUV, 0.0);\n            totalWeight = totalWeight + 1.0;\n        }\n    }\n\n    return color / totalWeight;\n}\n";
const LittleEndianness = 18761;
const TiffMagicNumber = 42;
const ByteFieldType = 1;
const AsciiFieldType = 2;
const ShortFieldType = 3;
const LongFieldType = 4;
const RationalFieldType = 5;
const SLongFieldType = 9;
const SRationalFieldType = 10;
function sizeOfFieldType(type) {
  switch (type) {
    case ByteFieldType:
    case AsciiFieldType:
      return 1;
    case ShortFieldType:
      return 2;
    case LongFieldType:
    case SLongFieldType:
      return 4;
    case RationalFieldType:
    case SRationalFieldType:
      return 8;
    default:
      return 0;
  }
}
function isContainerFieldType(type) {
  return type === AsciiFieldType || type === ByteFieldType;
}
class TiffDataView extends DataView {
  setEndianness(endianness) {
    this.setUint16(0, endianness, true);
  }
  setMagicNumber(magic = TiffMagicNumber) {
    this.setUint16(2, magic, true);
  }
  setFirstIfdOffset(firstIfdOffset = 8) {
    this.setUint32(4, firstIfdOffset, true);
  }
  getAscii(offset, length) {
    let str = "";
    for (let i = 0; i < length; i++) {
      const charCode = this.getUint8(offset + i);
      if (charCode === 0)
        break;
      str += String.fromCharCode(charCode);
    }
    return str.trim();
  }
  setAscii(offset, str, length) {
    const bytes = new Uint8Array(this.buffer, this.byteOffset + offset, length);
    bytes.fill(0);
    const len = Math.min(length, str.length);
    for (let i = 0; i < len; i++) {
      bytes[i] = str.charCodeAt(i) & 255;
    }
  }
  getRational(offset, littleEndian) {
    const numerator = this.getUint32(offset, littleEndian);
    const denominator = this.getUint32(offset + 4, littleEndian);
    return numerator / denominator;
  }
  getSRational(offset, littleEndian) {
    const sNumerator = this.getInt32(offset, littleEndian);
    const sDenominator = this.getInt32(offset + 4, littleEndian);
    return sNumerator / sDenominator;
  }
  getEndianness() {
    return this.getUint16(0, true);
  }
  getLittleEndian() {
    return this.getEndianness() === LittleEndianness;
  }
  getMagicNumber(littleEndian = this.getLittleEndian()) {
    return this.getUint16(2, littleEndian);
  }
  getFirstIfdOffset(littleEndian = this.getLittleEndian()) {
    const ifdOffset = this.getUint32(4, littleEndian);
    if (ifdOffset < 8 || ifdOffset + 2 > this.byteLength)
      return null;
    return ifdOffset;
  }
  getIfdEntryCount(ifdOffset, littleEndian = this.getLittleEndian()) {
    if (ifdOffset < 8 || ifdOffset + 2 > this.byteLength)
      return null;
    return this.getUint16(ifdOffset, littleEndian);
  }
  getIfdEntryOffset(ifdOffset, entryIndex) {
    return ifdOffset + 2 + entryIndex * 12;
  }
  getIfdNextOffset(ifdOffset, littleEndian = this.getLittleEndian()) {
    const entryCount = this.getIfdEntryCount(ifdOffset, littleEndian);
    if (entryCount === null)
      return null;
    const nextOffsetPos = ifdOffset + 2 + entryCount * 12;
    if (nextOffsetPos + 4 > this.byteLength)
      return null;
    return this.getUint32(nextOffsetPos, littleEndian);
  }
  getIfdEntries(ifdOffset, littleEndian = this.getLittleEndian()) {
    const entryCount = this.getIfdEntryCount(ifdOffset, littleEndian);
    if (entryCount === null)
      return [];
    const ifdByteLength = 2 + entryCount * 12 + 4;
    if (ifdOffset + ifdByteLength > this.byteLength)
      return [];
    const entries = [];
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = this.getIfdEntryOffset(ifdOffset, i);
      entries.push(this.getTagEntry(entryOffset, littleEndian));
    }
    return entries;
  }
  getIfdTagValues(ifdOffset, tagId, littleEndian = this.getLittleEndian()) {
    const entryCount = this.getIfdEntryCount(ifdOffset, littleEndian);
    if (entryCount === null)
      return null;
    const ifdByteLength = 2 + entryCount * 12 + 4;
    if (ifdOffset + ifdByteLength > this.byteLength)
      return null;
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = this.getIfdEntryOffset(ifdOffset, i);
      const header = this.getTagHeader(entryOffset, littleEndian);
      if (header.tagId !== tagId)
        continue;
      const typeSize = sizeOfFieldType(header.type);
      if (typeSize <= 0 || header.count <= 0)
        return null;
      const byteLen = typeSize * header.count;
      const valueOffset = byteLen <= 4 ? entryOffset + 8 : this.getUint32(entryOffset + 8, littleEndian);
      if (valueOffset + byteLen > this.byteLength)
        return null;
      if (isContainerFieldType(header.type)) {
        return this.getContainer(valueOffset, header.type, header.count);
      }
      if (header.count === 1) {
        return this.getValue(valueOffset, header.type, littleEndian);
      }
      const values = [];
      for (let j = 0; j < header.count; j++) {
        const v = this.getValue(
          valueOffset + j * typeSize,
          header.type,
          littleEndian
        );
        if (typeof v !== "number")
          return null;
        values.push(v);
      }
      return values;
    }
    return null;
  }
  getIfdTagNumberArray(ifdOffset, tagId, littleEndian = this.getLittleEndian()) {
    const v = this.getIfdTagValues(ifdOffset, tagId, littleEndian);
    if (typeof v === "number")
      return [v];
    if (Array.isArray(v) && v.every((x) => typeof x === "number"))
      return v;
    return null;
  }
  getTagHeader(offset, littleEndian) {
    return {
      tagId: this.getUint16(offset, littleEndian),
      type: this.getUint16(offset + 2, littleEndian),
      count: this.getUint32(offset + 4, littleEndian)
    };
  }
  setTagHeader(offset, tagId, type, count2, littleEndian) {
    this.setUint16(offset, tagId, littleEndian);
    this.setUint16(offset + 2, type, littleEndian);
    this.setUint32(offset + 4, count2, littleEndian);
  }
  setTagValueOrOffset(offset, valueOrOffset, littleEndian) {
    this.setUint32(offset + 8, valueOrOffset, littleEndian);
  }
  setTagEntry(offset, tagId, type, count2, valueOrOffset, littleEndian) {
    this.setTagHeader(offset, tagId, type, count2, littleEndian);
    this.setTagValueOrOffset(offset, valueOrOffset, littleEndian);
  }
  setShortArray(offset, values, littleEndian) {
    for (let i = 0; i < values.length; i++) {
      this.setUint16(offset + i * 2, values[i], littleEndian);
    }
  }
  getValue(offset, type, littleEndian) {
    switch (type) {
      case ShortFieldType:
        return this.getUint16(offset, littleEndian);
      case LongFieldType:
        return this.getUint32(offset, littleEndian);
      case RationalFieldType:
        return this.getRational(offset, littleEndian);
      case SRationalFieldType:
        return this.getSRational(offset, littleEndian);
      default:
        return null;
    }
  }
  getContainer(offset, type, count2) {
    switch (type) {
      case AsciiFieldType:
        return this.getAscii(offset, count2);
      case ByteFieldType:
        return this.buffer.slice(
          this.byteOffset + offset,
          this.byteOffset + offset + count2
        );
      default:
        return null;
    }
  }
  getTagEntry(offset, littleEndian) {
    const { tagId, type, count: count2 } = this.getTagHeader(offset, littleEndian);
    const typeSize = sizeOfFieldType(type);
    const totalSize = typeSize * count2;
    let valueOffset = offset + 8;
    if (totalSize > 4) {
      valueOffset = this.getUint32(offset + 8, littleEndian);
    }
    const value = isContainerFieldType(type) ? this.getContainer(valueOffset, type, count2) : this.getValue(valueOffset, type, littleEndian);
    return {
      tagId,
      value
    };
  }
  setIfdEntryCount(ifdOffset, entryCount, littleEndian = true) {
    this.setUint16(ifdOffset, entryCount, littleEndian);
  }
  setIfdEntry(ifdOffset, entryIndex, tagId, type, count2, valueOrOffset, littleEndian = true) {
    const entryOffset = ifdOffset + 2 + entryIndex * 12;
    this.setTagEntry(entryOffset, tagId, type, count2, valueOrOffset, littleEndian);
  }
  setIfdNextOffset(ifdOffset, entryCount, nextIfdOffset, littleEndian = true) {
    this.setUint32(ifdOffset + 2 + entryCount * 12, nextIfdOffset, littleEndian);
  }
}
const MakeTagId = 271;
const ModelTagId = 272;
const ExifOffsetTagId = 34665;
const ExposureTimeTagId = 33434;
const FNumberTagId = 33437;
const ISOTagId = 34855;
const FocalLengthTagId = 37386;
const LensModelTagId = 42035;
class ExifDataView extends TiffDataView {
  getTagEntries() {
    const result = [];
    const littleEndian = this.getLittleEndian();
    const firstIfdOffset = this.getFirstIfdOffset(littleEndian);
    if (!firstIfdOffset)
      return result;
    const ifdOffsetsToRead = [firstIfdOffset];
    const visited = /* @__PURE__ */ new Set();
    while (ifdOffsetsToRead.length > 0) {
      const currentIfdOffset = ifdOffsetsToRead.pop();
      if (currentIfdOffset === void 0)
        break;
      if (visited.has(currentIfdOffset))
        continue;
      visited.add(currentIfdOffset);
      const tags = this.getIfdEntries(currentIfdOffset, littleEndian);
      for (const tag of tags) {
        result.push(tag);
        if (tag.tagId === ExifOffsetTagId && typeof tag.value === "number") {
          ifdOffsetsToRead.push(tag.value);
        }
      }
    }
    return result;
  }
}
const SOIMarker = 65496;
const APP1Marker = 65505;
const ExifHeaderMarker = 1165519206;
const ZeroMarker = 0;
const PrefixMarker = 65280;
class JpegDataView extends DataView {
  getExif() {
    let offset = 0;
    if (this.byteLength > 1 && this.getUint16(offset) === SOIMarker) {
      offset += 2;
    }
    while (offset < this.byteLength) {
      if (offset + 1 >= this.byteLength)
        break;
      const marker = this.getUint16(offset);
      offset += 2;
      if (marker === APP1Marker) {
        if (offset + 1 >= this.byteLength)
          break;
        const segmentLength = this.getUint16(offset);
        if (this.getUint32(offset + 2) === ExifHeaderMarker && this.getUint16(offset + 6) === ZeroMarker) {
          return new ExifDataView(
            this.buffer,
            this.byteOffset + offset + 8,
            segmentLength - 8
          );
        }
        offset += segmentLength;
      } else {
        if ((marker & PrefixMarker) !== PrefixMarker)
          break;
        if (offset + 1 >= this.byteLength)
          break;
        const segmentLength = this.getUint16(offset);
        offset += segmentLength;
      }
    }
    return null;
  }
}
const JpegImageOffset = 84;
const JpegImageLength = 88;
const CfaHeaderOffset = 92;
const CfaHeaderLength = 96;
const CfaOffset = 100;
const CfaLength = 104;
const QualityTagId = 4096;
const SharpnessTagId = 4097;
const WhiteBalanceTagId = 4098;
const SaturationTagId = 4099;
const ContrastTagId = 4100;
const ColorTemperatureTagId = 4101;
const Contrast2TagId = 4102;
const WhiteBalanceFineTuneTagId = 4106;
const NoiseReductionTagId = 4107;
const NoiseReduction2TagId = 4110;
const ClarityTagId = 4111;
const FujiFlashModeTagId = 4112;
const FlashExposureCompTagId = 4113;
const MacroTagId = 4128;
const FocusModeTagId = 4129;
const AFModeTagId = 4130;
const FocusPixelTagId = 4131;
const SlowSyncTagId = 4144;
const PictureModeTagId = 4145;
const ExposureCountTagId = 4146;
const EXRAutoTagId = 4147;
const EXRModeTagId = 4148;
const MultipleExposureTagId = 4151;
const ShadowToneTagId = 4160;
const HighlightToneTagId = 4161;
const DigitalZoomTagId = 4164;
const LensModulationOptimizerTagId = 4165;
const GrainEffectTagId = 4167;
const DimensionsTagId = 273;
class CfaHeaderDataView extends DataView {
  getString(offset, length) {
    const bytes = new Uint8Array(this.buffer, this.byteOffset + offset, length);
    let len = length;
    while (len > 0 && bytes[len - 1] === 0) len--;
    return new TextDecoder().decode(bytes.subarray(0, len));
  }
  getTagEntry(offset) {
    const tagId = this.getUint16(offset, false);
    const size = this.getUint16(offset + 2, false);
    const dataOffset = offset + 4;
    switch (tagId) {
      case QualityTagId:
        return {
          tagId,
          value: this.getString(dataOffset, size)
        };
      case SharpnessTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case WhiteBalanceTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case SaturationTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case ContrastTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case ColorTemperatureTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case Contrast2TagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case WhiteBalanceFineTuneTagId:
        return {
          tagId,
          value: [
            this.getUint16(dataOffset, false),
            this.getUint16(dataOffset + 2, false)
          ]
        };
      case NoiseReductionTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case NoiseReduction2TagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case ClarityTagId:
        return {
          tagId,
          value: this.getUint32(dataOffset, false)
        };
      case FujiFlashModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case FlashExposureCompTagId:
        return {
          tagId,
          value: this.getInt16(dataOffset, false)
        };
      case MacroTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case FocusModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case AFModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case FocusPixelTagId:
        return {
          tagId,
          value: [
            this.getUint16(dataOffset, false),
            this.getUint16(dataOffset + 2, false)
          ]
        };
      case SlowSyncTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case PictureModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case ExposureCountTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case EXRAutoTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case EXRModeTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case MultipleExposureTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case ShadowToneTagId:
        return {
          tagId,
          value: this.getInt32(dataOffset, false)
        };
      case HighlightToneTagId:
        return {
          tagId,
          value: this.getInt32(dataOffset, false)
        };
      case DigitalZoomTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case LensModulationOptimizerTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case GrainEffectTagId:
        return {
          tagId,
          value: this.getUint16(dataOffset, false)
        };
      case DimensionsTagId:
        return {
          tagId,
          value: [
            this.getUint16(dataOffset, false),
            this.getUint16(dataOffset + 2, false)
          ]
        };
      default:
        return { tagId, value: null };
    }
  }
  getTagEntries() {
    const count2 = this.getUint32(0, false);
    let offset = 4;
    const entries = [];
    for (let i = 0; i < count2; i++) {
      const size = this.getUint16(offset + 2, false);
      const entry = this.getTagEntry(offset);
      if (entry.value !== null) {
        entries.push(entry);
      }
      offset += 4 + size;
    }
    return entries;
  }
}
class CfaPayloadDataView extends TiffDataView {
  getImageWidth(ifdOffset, littleEndian) {
    const v = this.getTagValues(ifdOffset, 256, littleEndian);
    return typeof v === "number" ? v : null;
  }
  getImageLength(ifdOffset, littleEndian) {
    const v = this.getTagValues(ifdOffset, 257, littleEndian);
    return typeof v === "number" ? v : null;
  }
  getBitsPerSample(ifdOffset, littleEndian) {
    const v = this.getTagValues(ifdOffset, 258, littleEndian);
    if (typeof v === "number")
      return v;
    if (Array.isArray(v) && typeof v[0] === "number")
      return v[0];
    return null;
  }
  getCompression(ifdOffset, littleEndian) {
    const v = this.getTagValues(ifdOffset, 259, littleEndian);
    return typeof v === "number" ? v : null;
  }
  getStripOffsets(ifdOffset, littleEndian) {
    return this.getNumberArrayTag(ifdOffset, 273, littleEndian);
  }
  getRowsPerStrip(ifdOffset, littleEndian) {
    const v = this.getTagValues(ifdOffset, 278, littleEndian);
    return typeof v === "number" ? v : null;
  }
  getStripByteCounts(ifdOffset, littleEndian) {
    return this.getNumberArrayTag(ifdOffset, 279, littleEndian);
  }
  getFirstIfdOffset(littleEndian) {
    const ifdOffset = this.getUint32(4, littleEndian);
    if (ifdOffset < 8 || ifdOffset + 2 > this.byteLength)
      return null;
    return ifdOffset;
  }
  getNumberArrayTag(ifdOffset, tagId, littleEndian) {
    const v = this.getTagValues(ifdOffset, tagId, littleEndian);
    if (typeof v === "number")
      return [v];
    if (Array.isArray(v) && v.every((x) => typeof x === "number"))
      return v;
    return null;
  }
  getTagValues(ifdOffset, tagId, littleEndian) {
    const entryCount = this.getUint16(ifdOffset, littleEndian);
    const ifdEntriesOffset = ifdOffset + 2;
    const ifdByteLength = 2 + entryCount * 12 + 4;
    if (ifdOffset + ifdByteLength > this.byteLength)
      return null;
    for (let i = 0; i < entryCount; i++) {
      const entryOffset = ifdEntriesOffset + i * 12;
      const header = this.getTagHeader(entryOffset, littleEndian);
      if (header.tagId !== tagId)
        continue;
      const typeSize = sizeOfFieldType(header.type);
      if (typeSize <= 0 || header.count <= 0)
        return null;
      const byteLen = typeSize * header.count;
      const valueOffset = byteLen <= 4 ? entryOffset + 8 : this.getUint32(entryOffset + 8, littleEndian);
      if (valueOffset + byteLen > this.byteLength)
        return null;
      if (isContainerFieldType(header.type)) {
        return this.getContainer(valueOffset, header.type, header.count);
      }
      if (header.count === 1) {
        return this.getValue(valueOffset, header.type, littleEndian);
      }
      const values = [];
      for (let j = 0; j < header.count; j++) {
        const v = this.getValue(
          valueOffset + j * typeSize,
          header.type,
          littleEndian
        );
        if (typeof v !== "number")
          return null;
        values.push(v);
      }
      return values;
    }
    return null;
  }
  joinStrips(stripOffsets, stripByteCounts) {
    if (stripOffsets.length !== stripByteCounts.length)
      return null;
    const totalBytes = stripByteCounts.reduce((sum2, n) => sum2 + n, 0);
    if (totalBytes <= 0)
      return null;
    const joined = new Uint8Array(totalBytes);
    let joinedOffset = 0;
    for (let i = 0; i < stripOffsets.length; i++) {
      const offset = stripOffsets[i];
      const len = stripByteCounts[i];
      if (offset + len > this.byteLength)
        return null;
      joined.set(
        new Uint8Array(this.buffer, this.byteOffset + offset, len),
        joinedOffset
      );
      joinedOffset += len;
    }
    return joined;
  }
}
class CfaDataView {
  constructor(raf) {
    this.raf = raf;
  }
  getHeader() {
    const cfaHeaderOffset = this.raf.getUint32(CfaHeaderOffset, false);
    const cfaHeaderLength = this.raf.getUint32(CfaHeaderLength, false);
    if (cfaHeaderOffset <= 0 || cfaHeaderLength <= 0)
      return null;
    const byteOffset = this.raf.byteOffset + cfaHeaderOffset;
    if (byteOffset + cfaHeaderLength > this.raf.buffer.byteLength)
      return null;
    return new CfaHeaderDataView(this.raf.buffer, byteOffset, cfaHeaderLength);
  }
  getPayload() {
    const cfaOffset = this.raf.getUint32(CfaOffset, false);
    const cfaLength = this.raf.getUint32(CfaLength, false);
    if (cfaOffset <= 0 || cfaLength <= 0)
      return null;
    const byteOffset = this.raf.byteOffset + cfaOffset;
    if (byteOffset + cfaLength > this.raf.buffer.byteLength)
      return null;
    return new CfaPayloadDataView(this.raf.buffer, byteOffset, cfaLength);
  }
}
class RafDataView extends DataView {
  getJpegImage() {
    const jpegOffset = this.getUint32(JpegImageOffset, false);
    const jpegLength = this.getUint32(JpegImageLength, false);
    if (jpegOffset <= 0 || jpegLength <= 0)
      return null;
    const byteOffset = this.byteOffset + jpegOffset;
    if (byteOffset + jpegLength > this.buffer.byteLength)
      return null;
    return new JpegDataView(this.buffer, byteOffset, jpegLength);
  }
  getCfa() {
    return new CfaDataView(this);
  }
}
async function createRafDataView(source) {
  const file = await source.handle.getFile();
  switch (source.mimeType) {
    case "image/x-fujifilm-raf":
      return new RafDataView(await file.arrayBuffer());
    default:
      return null;
  }
}
function unpackMsbToU16(packed, bitsPerSample, pixelCount) {
  const out = new Uint16Array(pixelCount);
  let bitIndex = 0;
  for (let i = 0; i < pixelCount; i++) {
    let value = 0;
    for (let b = 0; b < bitsPerSample; b++) {
      const absoluteBit = bitIndex + b;
      const byteIndex = absoluteBit >> 3;
      const bitInByte = 7 - (absoluteBit & 7);
      const bit = packed[byteIndex] >> bitInByte & 1;
      value = value << 1 | bit;
    }
    out[i] = value;
    bitIndex += bitsPerSample;
  }
  return out;
}
function getRafRasterFromPayload(payload, expectedWidth, expectedHeight) {
  if (payload.byteLength < 8)
    return null;
  const view = new CfaPayloadDataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const littleEndian = view.getLittleEndian();
  const firstIfdOffset = view.getFirstIfdOffset(littleEndian);
  if (!firstIfdOffset)
    return null;
  const width = view.getImageWidth(firstIfdOffset, littleEndian);
  const height = view.getImageLength(firstIfdOffset, littleEndian);
  if (!width || !height)
    return null;
  if (expectedWidth !== void 0 && expectedWidth !== width)
    return null;
  if (expectedHeight !== void 0 && expectedHeight !== height)
    return null;
  const bitsPerSample = view.getBitsPerSample(firstIfdOffset, littleEndian);
  if (!bitsPerSample)
    return null;
  const compression = view.getCompression(firstIfdOffset, littleEndian);
  if (compression !== 1)
    return null;
  const stripOffsets = view.getStripOffsets(firstIfdOffset, littleEndian);
  const stripByteCounts = view.getStripByteCounts(firstIfdOffset, littleEndian);
  if (!stripOffsets || !stripByteCounts)
    return null;
  const data = view.joinStrips(stripOffsets, stripByteCounts);
  if (!data)
    return null;
  const swapEndian = !littleEndian && bitsPerSample === 16;
  return {
    bitsPerSample,
    swapEndian,
    data
  };
}
function decodeRafRasterToU16(raster, width, height) {
  const pixelCount = width * height;
  if (raster.bitsPerSample === 16) {
    const bytes = raster.data;
    if (bytes.byteLength < pixelCount * 2)
      return null;
    const out = new Uint16Array(pixelCount);
    const dv2 = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    for (let i = 0; i < pixelCount; i++) {
      const v = dv2.getUint16(i * 2, true);
      out[i] = raster.swapEndian ? (v & 255) << 8 | (v & 65280) >> 8 : v;
    }
    return out;
  }
  if (raster.bitsPerSample > 0 && raster.bitsPerSample < 16) {
    const values = unpackMsbToU16(raster.data, raster.bitsPerSample, pixelCount);
    return values;
  }
  return null;
}
function useFile(fileItem) {
  const { data: file } = useSuspenseQuery({
    queryKey: ["file", fileItem],
    queryFn: async () => {
      if (!fileItem)
        return null;
      return await fileItem.handle.getFile();
    },
    staleTime: Infinity
  });
  return { file };
}
function usePreview(fileItem) {
  const { file } = useFile(fileItem);
  const { data: blob } = useSuspenseQuery({
    queryKey: ["preview", fileItem, file],
    queryFn: async () => {
      if (!file)
        return null;
      if (fileItem?.mimeType === "image/x-fujifilm-raf") {
        const buffer = await file.arrayBuffer();
        const view = new RafDataView(buffer);
        const jpgView = view.getJpegImage();
        if (!jpgView)
          return null;
        return new Blob([jpgView], {
          type: "image/jpeg"
        });
      }
      return file;
    },
    staleTime: Infinity
  });
  return { blob };
}
function useThumbnailPipeline(device) {
  return useSuspenseQuery({
    queryKey: ["thumbnail-pipeline", device],
    queryFn: () => {
      if (!device)
        return null;
      const shaderModule = device.createShaderModule({
        code: thumbnailShader
      });
      return device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vs_main"
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [
            {
              format: "rgba8unorm"
            }
          ]
        },
        primitive: {
          topology: "triangle-strip"
        }
      });
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useThumbnail(fileItem, width = 256, height = 256, quality = 1) {
  const { device } = useGpuDevice();
  const { blob } = usePreview(fileItem);
  const pipeline = useThumbnailPipeline(device);
  const fileName = fileItem?.handle.name ?? null;
  const mimeType = fileItem?.mimeType ?? null;
  const blobType = blob?.type ?? null;
  const blobSize = blob?.size ?? 0;
  return useSuspenseQuery({
    queryKey: [
      "thumbnail",
      fileName,
      mimeType,
      blob,
      blobType,
      blobSize,
      width,
      height,
      quality,
      device,
      pipeline.data
    ],
    queryFn: async () => {
      if (!device || !pipeline.data || !blob)
        return null;
      if (!blob.type.startsWith("image/") && mimeType !== "image/x-fujifilm-raf")
        return null;
      let bitmap = null;
      let srcTexture = null;
      let dstTexture = null;
      let uniformBuffer = null;
      let readBuffer = null;
      const bytesPerPixel = 4;
      const unpaddedBytesPerRow = width * bytesPerPixel;
      const align = 256;
      const paddedBytesPerRow = Math.ceil(unpaddedBytesPerRow / align) * align;
      const bufferSize = paddedBytesPerRow * height;
      try {
        bitmap = await createImageBitmap(blob);
        if (bitmap.width <= 0 || bitmap.height <= 0)
          return null;
        srcTexture = device.createTexture({
          size: [bitmap.width, bitmap.height],
          format: "rgba8unorm",
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        device.queue.copyExternalImageToTexture(
          { source: bitmap },
          { texture: srcTexture },
          [bitmap.width, bitmap.height]
        );
        dstTexture = device.createTexture({
          size: [width, height],
          format: "rgba8unorm",
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        });
        const ratioW = width / bitmap.width;
        const ratioH = height / bitmap.height;
        const scale = Math.max(ratioW, ratioH);
        const uvScaleX = ratioW / scale;
        const uvScaleY = ratioH / scale;
        const uvOffsetX = (1 - uvScaleX) / 2;
        const uvOffsetY = (1 - uvScaleY) / 2;
        const uniformData = new Float32Array([
          uvScaleX,
          uvScaleY,
          uvOffsetX,
          uvOffsetY
        ]);
        uniformBuffer = device.createBuffer({
          size: uniformData.byteLength,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);
        readBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
        const bindGroup = device.createBindGroup({
          layout: pipeline.data.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: device.createSampler({
                magFilter: "linear",
                minFilter: "linear"
              })
            },
            { binding: 1, resource: srcTexture.createView() },
            { binding: 2, resource: { buffer: uniformBuffer } }
          ]
        });
        const commandEncoder = device.createCommandEncoder();
        const pass = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: dstTexture.createView(),
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: "clear",
              storeOp: "store"
            }
          ]
        });
        pass.setPipeline(pipeline.data);
        pass.setBindGroup(0, bindGroup);
        pass.draw(4);
        pass.end();
        commandEncoder.copyTextureToBuffer(
          { texture: dstTexture },
          { buffer: readBuffer, bytesPerRow: paddedBytesPerRow },
          [width, height]
        );
        device.queue.submit([commandEncoder.finish()]);
        await readBuffer.mapAsync(GPUMapMode.READ);
        const mappedRange = readBuffer.getMappedRange();
        const mappedData = new Uint8Array(mappedRange);
        const imageData = new ImageData(width, height);
        for (let y = 0; y < height; y++) {
          const row = mappedData.subarray(
            y * paddedBytesPerRow,
            y * paddedBytesPerRow + unpaddedBytesPerRow
          );
          imageData.data.set(row, y * unpaddedBytesPerRow);
        }
        readBuffer.unmap();
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx)
          return null;
        ctx.putImageData(imageData, 0, 0);
        return canvas.toDataURL("image/webp", quality);
      } finally {
        bitmap?.close();
        srcTexture?.destroy();
        dstTexture?.destroy();
        uniformBuffer?.destroy();
        readBuffer?.destroy();
      }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
const setting = discriminatedUnion("id", [
  object({
    id: literal("theme"),
    value: _enum(["dark", "light"])
  }),
  object({
    id: literal("sidebarCollapsed"),
    value: boolean()
  }),
  object({
    id: literal("filmstripCollapsed"),
    value: boolean()
  }),
  object({
    id: literal("sidebarSectionCollapsedInfo"),
    value: boolean()
  }),
  object({
    id: literal("sidebarSectionCollapsedLighting"),
    value: boolean()
  }),
  object({
    id: literal("sidebarSectionCollapsedCamera"),
    value: boolean()
  }),
  object({
    id: literal("sidebarSectionCollapsedGroupedFiles"),
    value: boolean()
  })
]);
const keymap = discriminatedUnion("command", [
  object({
    command: literal("navigateNext"),
    key: string().default("ArrowRight")
  }),
  object({
    command: literal("navigatePrevious"),
    key: string().default("ArrowLeft")
  }),
  object({
    command: literal("selectFirst"),
    key: string().default("Home")
  }),
  object({
    command: literal("selectLast"),
    key: string().default("End")
  })
]);
const keymapsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: (item) => item.command,
    id: "fade-keymaps",
    schema: keymap,
    storageKey: "fade-keymaps"
  })
);
const settingsCollection = createCollection(
  localStorageCollectionOptions({
    getKey: (item) => item.id,
    id: "fade-settings",
    schema: setting,
    storageKey: "fade-settings"
  })
);
function FileIcon({ type, className }) {
  if (!type) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileQuestionMark, { className });
  }
  if (type.startsWith("video/")) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FilePlay, { className });
  }
  if (type.startsWith("audio/")) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileHeadphone, { className });
  }
  if (type.startsWith("text/")) {
    if (type.includes("html") || type.includes("css") || type.includes("javascript") || type.includes("json") || type.includes("xml")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(FileCode, { className });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className });
  }
  if (type.includes("pdf")) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className });
  }
  if (type.includes("zip") || type.includes("rar") || type.includes("tar") || type.includes("7z") || type.includes("compressed")) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(FileArchive, { className });
  }
  if (type.startsWith("application/")) {
    if (type.includes("json") || type.includes("xml") || type.includes("javascript")) {
      return /* @__PURE__ */ jsxRuntimeExports.jsx(FileCode, { className });
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(File$1, { className });
}
const ITEM_SIZE = 88;
function Filmstrip() {
  const { files, selectedIndex, selectFile } = useGallery();
  const ref = reactExports.useRef(null);
  const { width } = useElementSize(ref);
  const { data } = useLiveQuery(
    (q) => q.from({ settings: settingsCollection }).where(({ settings }) => eq(settings.id, "filmstripCollapsed")).findOne()
  );
  const isCollapsed = data?.value || false;
  const virtualizer = useVirtualizer({
    horizontal: true,
    count: files.length,
    getScrollElement: () => ref.current,
    estimateSize: () => ITEM_SIZE,
    overscan: width > 0 ? Math.ceil(width / ITEM_SIZE) : 5
  });
  reactExports.useEffect(() => {
    virtualizer.scrollToIndex(selectedIndex, {
      align: "center",
      behavior: "smooth"
    });
  }, [selectedIndex, virtualizer]);
  const modes = new Map(
    virtualizer.getVirtualItems().map((v) => [v.index, "visible"])
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: `bg-base-200 border-base-300 relative border-t transition-all duration-250 ${isCollapsed ? "h-4" : "h-30"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn btn-sm btn-square absolute -top-3 left-1/2 z-5 h-6 min-h-0 w-8 -translate-x-1/2 rounded-none rounded-t-md border-b-0",
            onClick: () => {
              if (data) {
                settingsCollection.update("filmstripCollapsed", (draft) => {
                  draft.value = !isCollapsed;
                });
              } else {
                settingsCollection.insert({
                  id: "filmstripCollapsed",
                  value: !isCollapsed
                });
              }
            },
            "aria-label": isCollapsed ? "Expand filmstrip" : "Collapse filmstrip",
            children: isCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isCollapsed ? "hidden" : "visible", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "scrollbar-thin h-full overflow-x-auto overflow-y-hidden",
            ref,
            children: files.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyFilmstrip, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "relative h-full w-full",
                style: {
                  width: `${virtualizer.getTotalSize().toString()}px`
                },
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FilmstripContent,
                  {
                    files,
                    modes,
                    selectedIndex,
                    onSelect: selectFile
                  }
                )
              }
            )
          }
        ) })
      ]
    }
  );
}
function EmptyFilmstrip() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "m-0 text-sm opacity-50", children: "Your files will appear here" }) });
}
function FilmstripContent({
  files,
  modes,
  selectedIndex,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: files.map((fileItem, index) => {
    const mode = modes.get(index) ?? "hidden";
    const start = index * ITEM_SIZE;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      FilmstripItem,
      {
        fileItem,
        isSelected: index === selectedIndex,
        onClick: () => {
          onSelect(index);
        },
        style: {
          transform: `translateX(${start.toString()}px)`,
          width: "80px"
        }
      }
    ) }, fileItem.handle.name);
  }) });
}
function FilmstripItem(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(FilmstripItemSkeleton, { ...props }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FilmstripItemContent, { ...props }) });
}
function FilmstripItemSkeleton({
  fileItem,
  isSelected,
  onClick,
  style
}) {
  const { handle } = fileItem;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      className: `bg-base-300 hover:border-base-content/50 absolute top-4 left-0 h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${isSelected ? "border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]" : "border-transparent"}`,
      style,
      onClick,
      "aria-label": `Select ${handle.name}`,
      "aria-current": isSelected ? "true" : "false",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-md opacity-50" }) })
    }
  );
}
function FilmstripItemContent({
  fileItem,
  isSelected,
  onClick,
  style
}) {
  const { handle } = fileItem;
  const { data: url } = useThumbnail(fileItem, 80, 80);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      className: `bg-base-300 hover:border-base-content/50 absolute top-4 left-0 h-20 w-20 cursor-pointer overflow-hidden rounded-lg border-2 p-0 transition-all duration-150 hover:-translate-y-0.5 ${isSelected ? "border-warning -translate-y-1 shadow-[0_0_15px_rgba(250,189,0,0.4)]" : "border-transparent"}`,
      style,
      onClick,
      "aria-label": `Select ${handle.name}`,
      "aria-current": isSelected ? "true" : "false",
      children: [
        url && fileItem?.mimeType?.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          Image$1,
          {
            src: url,
            alt: handle.name,
            className: "h-full w-full object-cover",
            layout: "constrained",
            width: 80,
            height: 80,
            background: "auto"
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileIcon, { type: fileItem?.mimeType, className: "h-8 w-8 opacity-50" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `pointer-events-none absolute inset-0 ${isSelected ? "from-warning/20 bg-linear-to-t to-transparent" : "bg-linear-to-t from-black/30 to-transparent"}`
          }
        )
      ]
    }
  );
}
function useKeydown(handler) {
  const savedHandlerRef = reactExports.useRef(handler);
  reactExports.useEffect(() => {
    savedHandlerRef.current = handler;
  }, [handler]);
  reactExports.useEffect(() => {
    const listener = (event) => {
      savedHandlerRef.current(event);
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
}
function useKeymap(command, handler) {
  const { data: keymap$1 } = useLiveQuery(
    (q) => q.from({ keymaps: keymapsCollection }).where(({ keymaps }) => eq(keymaps.command, command)).findOne()
  );
  useKeydown((event) => {
    const activeKeymap = keymap$1 ?? keymap.parse({ command });
    if (activeKeymap.key === event.key) {
      event.preventDefault();
      handler();
    }
  });
}
var ieee754 = {};
var hasRequiredIeee754;
function requireIeee754() {
  if (hasRequiredIeee754) return ieee754;
  hasRequiredIeee754 = 1;
  ieee754.read = function(buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };
  ieee754.write = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
    }
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
    }
    buffer[offset + i - d] |= s * 128;
  };
  return ieee754;
}
requireIeee754();
const WINDOWS_1252_EXTRA = {
  128: "€",
  130: "‚",
  131: "ƒ",
  132: "„",
  133: "…",
  134: "†",
  135: "‡",
  136: "ˆ",
  137: "‰",
  138: "Š",
  139: "‹",
  140: "Œ",
  142: "Ž",
  145: "‘",
  146: "’",
  147: "“",
  148: "”",
  149: "•",
  150: "–",
  151: "—",
  152: "˜",
  153: "™",
  154: "š",
  155: "›",
  156: "œ",
  158: "ž",
  159: "Ÿ"
};
for (const [code, char] of Object.entries(WINDOWS_1252_EXTRA)) {
}
let _utf8Decoder;
function utf8Decoder() {
  if (typeof globalThis.TextDecoder === "undefined")
    return void 0;
  return _utf8Decoder !== null && _utf8Decoder !== void 0 ? _utf8Decoder : _utf8Decoder = new globalThis.TextDecoder("utf-8");
}
const CHUNK = 32 * 1024;
function textDecode(bytes, encoding = "utf-8") {
  switch (encoding.toLowerCase()) {
    case "utf-8":
    case "utf8": {
      const dec = utf8Decoder();
      return dec ? dec.decode(bytes) : decodeUTF8(bytes);
    }
    case "utf-16le":
      return decodeUTF16LE(bytes);
    case "us-ascii":
    case "ascii":
      return decodeASCII(bytes);
    case "latin1":
    case "iso-8859-1":
      return decodeLatin1(bytes);
    case "windows-1252":
      return decodeWindows1252(bytes);
    default:
      throw new RangeError(`Encoding '${encoding}' not supported`);
  }
}
function decodeUTF8(bytes) {
  const parts = [];
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b1 = bytes[i++];
    if (b1 < 128) {
      out += String.fromCharCode(b1);
    } else if (b1 < 224) {
      const b2 = bytes[i++] & 63;
      out += String.fromCharCode((b1 & 31) << 6 | b2);
    } else if (b1 < 240) {
      const b2 = bytes[i++] & 63;
      const b3 = bytes[i++] & 63;
      out += String.fromCharCode((b1 & 15) << 12 | b2 << 6 | b3);
    } else {
      const b2 = bytes[i++] & 63;
      const b3 = bytes[i++] & 63;
      const b4 = bytes[i++] & 63;
      let cp = (b1 & 7) << 18 | b2 << 12 | b3 << 6 | b4;
      cp -= 65536;
      out += String.fromCharCode(55296 + (cp >> 10 & 1023), 56320 + (cp & 1023));
    }
    if (out.length >= CHUNK) {
      parts.push(out);
      out = "";
    }
  }
  if (out)
    parts.push(out);
  return parts.join("");
}
function decodeUTF16LE(bytes) {
  const len = bytes.length & -2;
  if (len === 0)
    return "";
  const parts = [];
  const maxUnits = CHUNK;
  for (let i = 0; i < len; ) {
    const unitsThis = Math.min(maxUnits, len - i >> 1);
    const units = new Array(unitsThis);
    for (let j = 0; j < unitsThis; j++, i += 2) {
      units[j] = bytes[i] | bytes[i + 1] << 8;
    }
    parts.push(String.fromCharCode.apply(null, units));
  }
  return parts.join("");
}
function decodeASCII(bytes) {
  const parts = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const end = Math.min(bytes.length, i + CHUNK);
    const codes = new Array(end - i);
    for (let j = i, k = 0; j < end; j++, k++) {
      codes[k] = bytes[j] & 127;
    }
    parts.push(String.fromCharCode.apply(null, codes));
  }
  return parts.join("");
}
function decodeLatin1(bytes) {
  const parts = [];
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const end = Math.min(bytes.length, i + CHUNK);
    const codes = new Array(end - i);
    for (let j = i, k = 0; j < end; j++, k++) {
      codes[k] = bytes[j];
    }
    parts.push(String.fromCharCode.apply(null, codes));
  }
  return parts.join("");
}
function decodeWindows1252(bytes) {
  const parts = [];
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    const extra = b >= 128 && b <= 159 ? WINDOWS_1252_EXTRA[b] : void 0;
    out += extra !== null && extra !== void 0 ? extra : String.fromCharCode(b);
    if (out.length >= CHUNK) {
      parts.push(out);
      out = "";
    }
  }
  if (out)
    parts.push(out);
  return parts.join("");
}
function dv(array) {
  return new DataView(array.buffer, array.byteOffset);
}
const UINT8 = {
  len: 1,
  get(array, offset) {
    return dv(array).getUint8(offset);
  },
  put(array, offset, value) {
    dv(array).setUint8(offset, value);
    return offset + 1;
  }
};
const UINT16_LE = {
  len: 2,
  get(array, offset) {
    return dv(array).getUint16(offset, true);
  },
  put(array, offset, value) {
    dv(array).setUint16(offset, value, true);
    return offset + 2;
  }
};
const UINT16_BE = {
  len: 2,
  get(array, offset) {
    return dv(array).getUint16(offset);
  },
  put(array, offset, value) {
    dv(array).setUint16(offset, value);
    return offset + 2;
  }
};
const UINT32_LE = {
  len: 4,
  get(array, offset) {
    return dv(array).getUint32(offset, true);
  },
  put(array, offset, value) {
    dv(array).setUint32(offset, value, true);
    return offset + 4;
  }
};
const UINT32_BE = {
  len: 4,
  get(array, offset) {
    return dv(array).getUint32(offset);
  },
  put(array, offset, value) {
    dv(array).setUint32(offset, value);
    return offset + 4;
  }
};
const INT32_BE = {
  len: 4,
  get(array, offset) {
    return dv(array).getInt32(offset);
  },
  put(array, offset, value) {
    dv(array).setInt32(offset, value);
    return offset + 4;
  }
};
const UINT64_LE = {
  len: 8,
  get(array, offset) {
    return dv(array).getBigUint64(offset, true);
  },
  put(array, offset, value) {
    dv(array).setBigUint64(offset, value, true);
    return offset + 8;
  }
};
class StringType {
  constructor(len, encoding) {
    this.len = len;
    this.encoding = encoding;
  }
  get(data, offset = 0) {
    const bytes = data.subarray(offset, offset + this.len);
    return textDecode(bytes, this.encoding);
  }
}
const defaultMessages = "End-Of-Stream";
class EndOfStreamError extends Error {
  constructor() {
    super(defaultMessages);
    this.name = "EndOfStreamError";
  }
}
class AbortError extends Error {
  constructor(message = "The operation was aborted") {
    super(message);
    this.name = "AbortError";
  }
}
class AbstractStreamReader {
  constructor() {
    this.endOfStream = false;
    this.interrupted = false;
    this.peekQueue = [];
  }
  async peek(uint8Array, mayBeLess = false) {
    const bytesRead = await this.read(uint8Array, mayBeLess);
    this.peekQueue.push(uint8Array.subarray(0, bytesRead));
    return bytesRead;
  }
  async read(buffer, mayBeLess = false) {
    if (buffer.length === 0) {
      return 0;
    }
    let bytesRead = this.readFromPeekBuffer(buffer);
    if (!this.endOfStream) {
      bytesRead += await this.readRemainderFromStream(buffer.subarray(bytesRead), mayBeLess);
    }
    if (bytesRead === 0 && !mayBeLess) {
      throw new EndOfStreamError();
    }
    return bytesRead;
  }
  /**
   * Read chunk from stream
   * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
   * @returns Number of bytes read
   */
  readFromPeekBuffer(buffer) {
    let remaining = buffer.length;
    let bytesRead = 0;
    while (this.peekQueue.length > 0 && remaining > 0) {
      const peekData = this.peekQueue.pop();
      if (!peekData)
        throw new Error("peekData should be defined");
      const lenCopy = Math.min(peekData.length, remaining);
      buffer.set(peekData.subarray(0, lenCopy), bytesRead);
      bytesRead += lenCopy;
      remaining -= lenCopy;
      if (lenCopy < peekData.length) {
        this.peekQueue.push(peekData.subarray(lenCopy));
      }
    }
    return bytesRead;
  }
  async readRemainderFromStream(buffer, mayBeLess) {
    let bytesRead = 0;
    while (bytesRead < buffer.length && !this.endOfStream) {
      if (this.interrupted) {
        throw new AbortError();
      }
      const chunkLen = await this.readFromStream(buffer.subarray(bytesRead), mayBeLess);
      if (chunkLen === 0)
        break;
      bytesRead += chunkLen;
    }
    if (!mayBeLess && bytesRead < buffer.length) {
      throw new EndOfStreamError();
    }
    return bytesRead;
  }
}
class WebStreamReader extends AbstractStreamReader {
  constructor(reader) {
    super();
    this.reader = reader;
  }
  async abort() {
    return this.close();
  }
  async close() {
    this.reader.releaseLock();
  }
}
class WebStreamByobReader extends WebStreamReader {
  /**
   * Read from stream
   * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
   * @param mayBeLess - If true, may fill the buffer partially
   * @protected Bytes read
   */
  async readFromStream(buffer, mayBeLess) {
    if (buffer.length === 0)
      return 0;
    const result = await this.reader.read(new Uint8Array(buffer.length), { min: mayBeLess ? void 0 : buffer.length });
    if (result.done) {
      this.endOfStream = result.done;
    }
    if (result.value) {
      buffer.set(result.value);
      return result.value.length;
    }
    return 0;
  }
}
class WebStreamDefaultReader extends AbstractStreamReader {
  constructor(reader) {
    super();
    this.reader = reader;
    this.buffer = null;
  }
  /**
   * Copy chunk to target, and store the remainder in this.buffer
   */
  writeChunk(target, chunk) {
    const written = Math.min(chunk.length, target.length);
    target.set(chunk.subarray(0, written));
    if (written < chunk.length) {
      this.buffer = chunk.subarray(written);
    } else {
      this.buffer = null;
    }
    return written;
  }
  /**
   * Read from stream
   * @param buffer - Target Uint8Array (or Buffer) to store data read from stream in
   * @param mayBeLess - If true, may fill the buffer partially
   * @protected Bytes read
   */
  async readFromStream(buffer, mayBeLess) {
    if (buffer.length === 0)
      return 0;
    let totalBytesRead = 0;
    if (this.buffer) {
      totalBytesRead += this.writeChunk(buffer, this.buffer);
    }
    while (totalBytesRead < buffer.length && !this.endOfStream) {
      const result = await this.reader.read();
      if (result.done) {
        this.endOfStream = true;
        break;
      }
      if (result.value) {
        totalBytesRead += this.writeChunk(buffer.subarray(totalBytesRead), result.value);
      }
    }
    if (!mayBeLess && totalBytesRead === 0 && this.endOfStream) {
      throw new EndOfStreamError();
    }
    return totalBytesRead;
  }
  abort() {
    this.interrupted = true;
    return this.reader.cancel();
  }
  async close() {
    await this.abort();
    this.reader.releaseLock();
  }
}
function makeWebStreamReader(stream) {
  try {
    const reader = stream.getReader({ mode: "byob" });
    if (reader instanceof ReadableStreamDefaultReader) {
      return new WebStreamDefaultReader(reader);
    }
    return new WebStreamByobReader(reader);
  } catch (error) {
    if (error instanceof TypeError) {
      return new WebStreamDefaultReader(stream.getReader());
    }
    throw error;
  }
}
class AbstractTokenizer {
  /**
   * Constructor
   * @param options Tokenizer options
   * @protected
   */
  constructor(options) {
    this.numBuffer = new Uint8Array(8);
    this.position = 0;
    this.onClose = options?.onClose;
    if (options?.abortSignal) {
      options.abortSignal.addEventListener("abort", () => {
        this.abort();
      });
    }
  }
  /**
   * Read a token from the tokenizer-stream
   * @param token - The token to read
   * @param position - If provided, the desired position in the tokenizer-stream
   * @returns Promise with token data
   */
  async readToken(token, position = this.position) {
    const uint8Array = new Uint8Array(token.len);
    const len = await this.readBuffer(uint8Array, { position });
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(uint8Array, 0);
  }
  /**
   * Peek a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   * @returns Promise with token data
   */
  async peekToken(token, position = this.position) {
    const uint8Array = new Uint8Array(token.len);
    const len = await this.peekBuffer(uint8Array, { position });
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(uint8Array, 0);
  }
  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  async readNumber(token) {
    const len = await this.readBuffer(this.numBuffer, { length: token.len });
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(this.numBuffer, 0);
  }
  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  async peekNumber(token) {
    const len = await this.peekBuffer(this.numBuffer, { length: token.len });
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(this.numBuffer, 0);
  }
  /**
   * Ignore number of bytes, advances the pointer in under tokenizer-stream.
   * @param length - Number of bytes to ignore
   * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
   */
  async ignore(length) {
    if (this.fileInfo.size !== void 0) {
      const bytesLeft = this.fileInfo.size - this.position;
      if (length > bytesLeft) {
        this.position += bytesLeft;
        return bytesLeft;
      }
    }
    this.position += length;
    return length;
  }
  async close() {
    await this.abort();
    await this.onClose?.();
  }
  normalizeOptions(uint8Array, options) {
    if (!this.supportsRandomAccess() && options && options.position !== void 0 && options.position < this.position) {
      throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
    }
    return {
      ...{
        mayBeLess: false,
        offset: 0,
        length: uint8Array.length,
        position: this.position
      },
      ...options
    };
  }
  abort() {
    return Promise.resolve();
  }
}
const maxBufferSize = 256e3;
class ReadStreamTokenizer extends AbstractTokenizer {
  /**
   * Constructor
   * @param streamReader stream-reader to read from
   * @param options Tokenizer options
   */
  constructor(streamReader, options) {
    super(options);
    this.streamReader = streamReader;
    this.fileInfo = options?.fileInfo ?? {};
  }
  /**
   * Read buffer from tokenizer
   * @param uint8Array - Target Uint8Array to fill with data read from the tokenizer-stream
   * @param options - Read behaviour options
   * @returns Promise with number of bytes read
   */
  async readBuffer(uint8Array, options) {
    const normOptions = this.normalizeOptions(uint8Array, options);
    const skipBytes = normOptions.position - this.position;
    if (skipBytes > 0) {
      await this.ignore(skipBytes);
      return this.readBuffer(uint8Array, options);
    }
    if (skipBytes < 0) {
      throw new Error("`options.position` must be equal or greater than `tokenizer.position`");
    }
    if (normOptions.length === 0) {
      return 0;
    }
    const bytesRead = await this.streamReader.read(uint8Array.subarray(0, normOptions.length), normOptions.mayBeLess);
    this.position += bytesRead;
    if ((!options || !options.mayBeLess) && bytesRead < normOptions.length) {
      throw new EndOfStreamError();
    }
    return bytesRead;
  }
  /**
   * Peek (read ahead) buffer from tokenizer
   * @param uint8Array - Uint8Array (or Buffer) to write data to
   * @param options - Read behaviour options
   * @returns Promise with number of bytes peeked
   */
  async peekBuffer(uint8Array, options) {
    const normOptions = this.normalizeOptions(uint8Array, options);
    let bytesRead = 0;
    if (normOptions.position) {
      const skipBytes = normOptions.position - this.position;
      if (skipBytes > 0) {
        const skipBuffer = new Uint8Array(normOptions.length + skipBytes);
        bytesRead = await this.peekBuffer(skipBuffer, { mayBeLess: normOptions.mayBeLess });
        uint8Array.set(skipBuffer.subarray(skipBytes));
        return bytesRead - skipBytes;
      }
      if (skipBytes < 0) {
        throw new Error("Cannot peek from a negative offset in a stream");
      }
    }
    if (normOptions.length > 0) {
      try {
        bytesRead = await this.streamReader.peek(uint8Array.subarray(0, normOptions.length), normOptions.mayBeLess);
      } catch (err) {
        if (options?.mayBeLess && err instanceof EndOfStreamError) {
          return 0;
        }
        throw err;
      }
      if (!normOptions.mayBeLess && bytesRead < normOptions.length) {
        throw new EndOfStreamError();
      }
    }
    return bytesRead;
  }
  async ignore(length) {
    const bufSize = Math.min(maxBufferSize, length);
    const buf2 = new Uint8Array(bufSize);
    let totBytesRead = 0;
    while (totBytesRead < length) {
      const remaining = length - totBytesRead;
      const bytesRead = await this.readBuffer(buf2, { length: Math.min(bufSize, remaining) });
      if (bytesRead < 0) {
        return bytesRead;
      }
      totBytesRead += bytesRead;
    }
    return totBytesRead;
  }
  abort() {
    return this.streamReader.abort();
  }
  async close() {
    return this.streamReader.close();
  }
  supportsRandomAccess() {
    return false;
  }
}
class BufferTokenizer extends AbstractTokenizer {
  /**
   * Construct BufferTokenizer
   * @param uint8Array - Uint8Array to tokenize
   * @param options Tokenizer options
   */
  constructor(uint8Array, options) {
    super(options);
    this.uint8Array = uint8Array;
    this.fileInfo = { ...options?.fileInfo ?? {}, ...{ size: uint8Array.length } };
  }
  /**
   * Read buffer from tokenizer
   * @param uint8Array - Uint8Array to tokenize
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async readBuffer(uint8Array, options) {
    if (options?.position) {
      this.position = options.position;
    }
    const bytesRead = await this.peekBuffer(uint8Array, options);
    this.position += bytesRead;
    return bytesRead;
  }
  /**
   * Peek (read ahead) buffer from tokenizer
   * @param uint8Array
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async peekBuffer(uint8Array, options) {
    const normOptions = this.normalizeOptions(uint8Array, options);
    const bytes2read = Math.min(this.uint8Array.length - normOptions.position, normOptions.length);
    if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
      throw new EndOfStreamError();
    }
    uint8Array.set(this.uint8Array.subarray(normOptions.position, normOptions.position + bytes2read));
    return bytes2read;
  }
  close() {
    return super.close();
  }
  supportsRandomAccess() {
    return true;
  }
  setPosition(position) {
    this.position = position;
  }
}
class BlobTokenizer extends AbstractTokenizer {
  /**
   * Construct BufferTokenizer
   * @param blob - Uint8Array to tokenize
   * @param options Tokenizer options
   */
  constructor(blob, options) {
    super(options);
    this.blob = blob;
    this.fileInfo = { ...options?.fileInfo ?? {}, ...{ size: blob.size, mimeType: blob.type } };
  }
  /**
   * Read buffer from tokenizer
   * @param uint8Array - Uint8Array to tokenize
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async readBuffer(uint8Array, options) {
    if (options?.position) {
      this.position = options.position;
    }
    const bytesRead = await this.peekBuffer(uint8Array, options);
    this.position += bytesRead;
    return bytesRead;
  }
  /**
   * Peek (read ahead) buffer from tokenizer
   * @param buffer
   * @param options - Read behaviour options
   * @returns {Promise<number>}
   */
  async peekBuffer(buffer, options) {
    const normOptions = this.normalizeOptions(buffer, options);
    const bytes2read = Math.min(this.blob.size - normOptions.position, normOptions.length);
    if (!normOptions.mayBeLess && bytes2read < normOptions.length) {
      throw new EndOfStreamError();
    }
    const arrayBuffer = await this.blob.slice(normOptions.position, normOptions.position + bytes2read).arrayBuffer();
    buffer.set(new Uint8Array(arrayBuffer));
    return bytes2read;
  }
  close() {
    return super.close();
  }
  supportsRandomAccess() {
    return true;
  }
  setPosition(position) {
    this.position = position;
  }
}
function fromWebStream(webStream, options) {
  const webStreamReader = makeWebStreamReader(webStream);
  const _options = options ?? {};
  const chainedClose = _options.onClose;
  _options.onClose = async () => {
    await webStreamReader.close();
    if (chainedClose) {
      return chainedClose();
    }
  };
  return new ReadStreamTokenizer(webStreamReader, _options);
}
function fromBuffer(uint8Array, options) {
  return new BufferTokenizer(uint8Array, options);
}
function fromBlob(blob, options) {
  return new BlobTokenizer(blob, options);
}
var src = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs) return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms = function(val, options) {
    options = options || {};
    var type = typeof val;
    if (type === "string" && val.length > 0) {
      return parse(val);
    } else if (type === "number" && isFinite(val)) {
      return options.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type = (match[2] || "ms").toLowerCase();
    switch (type) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon) return common;
  hasRequiredCommon = 1;
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable;
    createDebug.enable = enable;
    createDebug.enabled = enabled;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash2 = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash2 = (hash2 << 5) - hash2 + namespace.charCodeAt(i);
        hash2 |= 0;
      }
      return createDebug.colors[Math.abs(hash2) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self.diff = ms2;
        self.prev = prevTime;
        self.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self, args);
        const logFn = self.log || createDebug.log;
        logFn.apply(self, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
      for (const ns of split) {
        if (ns[0] === "-") {
          createDebug.skips.push(ns.slice(1));
        } else {
          createDebug.names.push(ns);
        }
      }
    }
    function matchesTemplate(search, template) {
      let searchIndex = 0;
      let templateIndex = 0;
      let starIndex = -1;
      let matchIndex = 0;
      while (searchIndex < search.length) {
        if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
          if (template[templateIndex] === "*") {
            starIndex = templateIndex;
            matchIndex = searchIndex;
            templateIndex++;
          } else {
            searchIndex++;
            templateIndex++;
          }
        } else if (starIndex !== -1) {
          templateIndex = starIndex + 1;
          matchIndex++;
          searchIndex = matchIndex;
        } else {
          return false;
        }
      }
      while (templateIndex < template.length && template[templateIndex] === "*") {
        templateIndex++;
      }
      return templateIndex === template.length;
    }
    function disable() {
      const namespaces = [
        ...createDebug.names,
        ...createDebug.skips.map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled(name) {
      for (const skip of createDebug.skips) {
        if (matchesTemplate(name, skip)) {
          return false;
        }
      }
      for (const ns of createDebug.names) {
        if (matchesTemplate(name, ns)) {
          return true;
        }
      }
      return false;
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser) return browser.exports;
  hasRequiredBrowser = 1;
  (function(module, exports$1) {
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.storage = localstorage();
    exports$1.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports$1.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c = "color: " + this.color;
      args.splice(1, 0, c, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c);
    }
    exports$1.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports$1.storage.setItem("debug", namespaces);
        } else {
          exports$1.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports$1.storage.getItem("debug") || exports$1.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(tty$1);
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag) return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv = process.argv) => {
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const position = argv.indexOf(prefix + flag);
    const terminatorPosition = argv.indexOf("--");
    return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor) return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os = require$$0$1;
  const tty2 = require$$0;
  const hasFlag2 = requireHasFlag();
  const { env } = process;
  let forceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false") || hasFlag2("color=never")) {
    forceColor = 0;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    forceColor = 1;
  }
  if ("FORCE_COLOR" in env) {
    if (env.FORCE_COLOR === "true") {
      forceColor = 1;
    } else if (env.FORCE_COLOR === "false") {
      forceColor = 0;
    } else {
      forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
    }
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(haveStream, streamIsTTY) {
    if (forceColor === 0) {
      return 0;
    }
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
    if (haveStream && !streamIsTTY && forceColor === void 0) {
      return 0;
    }
    const min2 = forceColor || 0;
    if (env.TERM === "dumb") {
      return min2;
    }
    if (process.platform === "win32") {
      const osRelease = os.release().split(".");
      if (Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min2;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    return min2;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream, stream && stream.isTTY);
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: translateLevel(supportsColor(true, tty2.isatty(1))),
    stderr: translateLevel(supportsColor(true, tty2.isatty(2)))
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node.exports;
  hasRequiredNode = 1;
  (function(module, exports$1) {
    const tty2 = require$$0;
    const util = require$$1;
    exports$1.init = init;
    exports$1.log = log;
    exports$1.formatArgs = formatArgs;
    exports$1.save = save;
    exports$1.load = load;
    exports$1.useColors = useColors;
    exports$1.destroy = util.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports$1.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports$1.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports$1.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports$1.inspectOpts ? Boolean(exports$1.inspectOpts.colors) : tty2.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c = this.color;
        const colorCode = "\x1B[3" + (c < 8 ? c : "8;5;" + c);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports$1.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log(...args) {
      return process.stderr.write(util.formatWithOptions(exports$1.inspectOpts, ...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports$1.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports$1.inspectOpts[keys[i]];
      }
    }
    module.exports = requireCommon()(exports$1);
    const { formatters } = module.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
var hasRequiredSrc;
function requireSrc() {
  if (hasRequiredSrc) return src.exports;
  hasRequiredSrc = 1;
  if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
    src.exports = requireBrowser();
  } else {
    src.exports = requireNode();
  }
  return src.exports;
}
var srcExports = requireSrc();
const initDebug = /* @__PURE__ */ getDefaultExportFromCjs(srcExports);
const Signature = {
  LocalFileHeader: 67324752,
  DataDescriptor: 134695760,
  CentralFileHeader: 33639248,
  EndOfCentralDirectory: 101010256
};
const DataDescriptor = {
  get(array) {
    return {
      signature: UINT32_LE.get(array, 0),
      compressedSize: UINT32_LE.get(array, 8),
      uncompressedSize: UINT32_LE.get(array, 12)
    };
  },
  len: 16
};
const LocalFileHeaderToken = {
  get(array) {
    const flags = UINT16_LE.get(array, 6);
    return {
      signature: UINT32_LE.get(array, 0),
      minVersion: UINT16_LE.get(array, 4),
      dataDescriptor: !!(flags & 8),
      compressedMethod: UINT16_LE.get(array, 8),
      compressedSize: UINT32_LE.get(array, 18),
      uncompressedSize: UINT32_LE.get(array, 22),
      filenameLength: UINT16_LE.get(array, 26),
      extraFieldLength: UINT16_LE.get(array, 28),
      filename: null
    };
  },
  len: 30
};
const EndOfCentralDirectoryRecordToken = {
  get(array) {
    return {
      signature: UINT32_LE.get(array, 0),
      nrOfThisDisk: UINT16_LE.get(array, 4),
      nrOfThisDiskWithTheStart: UINT16_LE.get(array, 6),
      nrOfEntriesOnThisDisk: UINT16_LE.get(array, 8),
      nrOfEntriesOfSize: UINT16_LE.get(array, 10),
      sizeOfCd: UINT32_LE.get(array, 12),
      offsetOfStartOfCd: UINT32_LE.get(array, 16),
      zipFileCommentLength: UINT16_LE.get(array, 20)
    };
  },
  len: 22
};
const FileHeader = {
  get(array) {
    const flags = UINT16_LE.get(array, 8);
    return {
      signature: UINT32_LE.get(array, 0),
      minVersion: UINT16_LE.get(array, 6),
      dataDescriptor: !!(flags & 8),
      compressedMethod: UINT16_LE.get(array, 10),
      compressedSize: UINT32_LE.get(array, 20),
      uncompressedSize: UINT32_LE.get(array, 24),
      filenameLength: UINT16_LE.get(array, 28),
      extraFieldLength: UINT16_LE.get(array, 30),
      fileCommentLength: UINT16_LE.get(array, 32),
      relativeOffsetOfLocalHeader: UINT32_LE.get(array, 42),
      filename: null
    };
  },
  len: 46
};
function signatureToArray(signature) {
  const signatureBytes = new Uint8Array(UINT32_LE.len);
  UINT32_LE.put(signatureBytes, 0, signature);
  return signatureBytes;
}
const debug = initDebug("tokenizer:inflate");
const syncBufferSize = 256 * 1024;
const ddSignatureArray = signatureToArray(Signature.DataDescriptor);
const eocdSignatureBytes = signatureToArray(Signature.EndOfCentralDirectory);
class ZipHandler {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.syncBuffer = new Uint8Array(syncBufferSize);
  }
  async isZip() {
    return await this.peekSignature() === Signature.LocalFileHeader;
  }
  peekSignature() {
    return this.tokenizer.peekToken(UINT32_LE);
  }
  async findEndOfCentralDirectoryLocator() {
    const randomReadTokenizer = this.tokenizer;
    const chunkLength = Math.min(16 * 1024, randomReadTokenizer.fileInfo.size);
    const buffer = this.syncBuffer.subarray(0, chunkLength);
    await this.tokenizer.readBuffer(buffer, { position: randomReadTokenizer.fileInfo.size - chunkLength });
    for (let i = buffer.length - 4; i >= 0; i--) {
      if (buffer[i] === eocdSignatureBytes[0] && buffer[i + 1] === eocdSignatureBytes[1] && buffer[i + 2] === eocdSignatureBytes[2] && buffer[i + 3] === eocdSignatureBytes[3]) {
        return randomReadTokenizer.fileInfo.size - chunkLength + i;
      }
    }
    return -1;
  }
  async readCentralDirectory() {
    if (!this.tokenizer.supportsRandomAccess()) {
      debug("Cannot reading central-directory without random-read support");
      return;
    }
    debug("Reading central-directory...");
    const pos = this.tokenizer.position;
    const offset = await this.findEndOfCentralDirectoryLocator();
    if (offset > 0) {
      debug("Central-directory 32-bit signature found");
      const eocdHeader = await this.tokenizer.readToken(EndOfCentralDirectoryRecordToken, offset);
      const files = [];
      this.tokenizer.setPosition(eocdHeader.offsetOfStartOfCd);
      for (let n = 0; n < eocdHeader.nrOfEntriesOfSize; ++n) {
        const entry = await this.tokenizer.readToken(FileHeader);
        if (entry.signature !== Signature.CentralFileHeader) {
          throw new Error("Expected Central-File-Header signature");
        }
        entry.filename = await this.tokenizer.readToken(new StringType(entry.filenameLength, "utf-8"));
        await this.tokenizer.ignore(entry.extraFieldLength);
        await this.tokenizer.ignore(entry.fileCommentLength);
        files.push(entry);
        debug(`Add central-directory file-entry: n=${n + 1}/${files.length}: filename=${files[n].filename}`);
      }
      this.tokenizer.setPosition(pos);
      return files;
    }
    this.tokenizer.setPosition(pos);
  }
  async unzip(fileCb) {
    const entries = await this.readCentralDirectory();
    if (entries) {
      return this.iterateOverCentralDirectory(entries, fileCb);
    }
    let stop = false;
    do {
      const zipHeader = await this.readLocalFileHeader();
      if (!zipHeader)
        break;
      const next = fileCb(zipHeader);
      stop = !!next.stop;
      let fileData;
      await this.tokenizer.ignore(zipHeader.extraFieldLength);
      if (zipHeader.dataDescriptor && zipHeader.compressedSize === 0) {
        const chunks = [];
        let len = syncBufferSize;
        debug("Compressed-file-size unknown, scanning for next data-descriptor-signature....");
        let nextHeaderIndex = -1;
        while (nextHeaderIndex < 0 && len === syncBufferSize) {
          len = await this.tokenizer.peekBuffer(this.syncBuffer, { mayBeLess: true });
          nextHeaderIndex = indexOf(this.syncBuffer.subarray(0, len), ddSignatureArray);
          const size = nextHeaderIndex >= 0 ? nextHeaderIndex : len;
          if (next.handler) {
            const data = new Uint8Array(size);
            await this.tokenizer.readBuffer(data);
            chunks.push(data);
          } else {
            await this.tokenizer.ignore(size);
          }
        }
        debug(`Found data-descriptor-signature at pos=${this.tokenizer.position}`);
        if (next.handler) {
          await this.inflate(zipHeader, mergeArrays(chunks), next.handler);
        }
      } else {
        if (next.handler) {
          debug(`Reading compressed-file-data: ${zipHeader.compressedSize} bytes`);
          fileData = new Uint8Array(zipHeader.compressedSize);
          await this.tokenizer.readBuffer(fileData);
          await this.inflate(zipHeader, fileData, next.handler);
        } else {
          debug(`Ignoring compressed-file-data: ${zipHeader.compressedSize} bytes`);
          await this.tokenizer.ignore(zipHeader.compressedSize);
        }
      }
      debug(`Reading data-descriptor at pos=${this.tokenizer.position}`);
      if (zipHeader.dataDescriptor) {
        const dataDescriptor = await this.tokenizer.readToken(DataDescriptor);
        if (dataDescriptor.signature !== 134695760) {
          throw new Error(`Expected data-descriptor-signature at position ${this.tokenizer.position - DataDescriptor.len}`);
        }
      }
    } while (!stop);
  }
  async iterateOverCentralDirectory(entries, fileCb) {
    for (const fileHeader of entries) {
      const next = fileCb(fileHeader);
      if (next.handler) {
        this.tokenizer.setPosition(fileHeader.relativeOffsetOfLocalHeader);
        const zipHeader = await this.readLocalFileHeader();
        if (zipHeader) {
          await this.tokenizer.ignore(zipHeader.extraFieldLength);
          const fileData = new Uint8Array(fileHeader.compressedSize);
          await this.tokenizer.readBuffer(fileData);
          await this.inflate(zipHeader, fileData, next.handler);
        }
      }
      if (next.stop)
        break;
    }
  }
  async inflate(zipHeader, fileData, cb) {
    if (zipHeader.compressedMethod === 0) {
      return cb(fileData);
    }
    if (zipHeader.compressedMethod !== 8) {
      throw new Error(`Unsupported ZIP compression method: ${zipHeader.compressedMethod}`);
    }
    debug(`Decompress filename=${zipHeader.filename}, compressed-size=${fileData.length}`);
    const uncompressedData = await ZipHandler.decompressDeflateRaw(fileData);
    return cb(uncompressedData);
  }
  static async decompressDeflateRaw(data) {
    const input = new ReadableStream({
      start(controller) {
        controller.enqueue(data);
        controller.close();
      }
    });
    const ds = new DecompressionStream("deflate-raw");
    const output2 = input.pipeThrough(ds);
    try {
      const response = new Response(output2);
      const buffer = await response.arrayBuffer();
      return new Uint8Array(buffer);
    } catch (err) {
      const message = err instanceof Error ? `Failed to deflate ZIP entry: ${err.message}` : "Unknown decompression error in ZIP entry";
      throw new TypeError(message);
    }
  }
  async readLocalFileHeader() {
    const signature = await this.tokenizer.peekToken(UINT32_LE);
    if (signature === Signature.LocalFileHeader) {
      const header = await this.tokenizer.readToken(LocalFileHeaderToken);
      header.filename = await this.tokenizer.readToken(new StringType(header.filenameLength, "utf-8"));
      return header;
    }
    if (signature === Signature.CentralFileHeader) {
      return false;
    }
    if (signature === 3759263696) {
      throw new Error("Encrypted ZIP");
    }
    throw new Error("Unexpected signature");
  }
}
function indexOf(buffer, portion) {
  const bufferLength = buffer.length;
  const portionLength = portion.length;
  if (portionLength > bufferLength)
    return -1;
  for (let i = 0; i <= bufferLength - portionLength; i++) {
    let found = true;
    for (let j = 0; j < portionLength; j++) {
      if (buffer[i + j] !== portion[j]) {
        found = false;
        break;
      }
    }
    if (found) {
      return i;
    }
  }
  return -1;
}
function mergeArrays(chunks) {
  const totalLength = chunks.reduce((acc, curr) => acc + curr.length, 0);
  const mergedArray = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    mergedArray.set(chunk, offset);
    offset += chunk.length;
  }
  return mergedArray;
}
class GzipHandler {
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
  }
  inflate() {
    const tokenizer = this.tokenizer;
    return new ReadableStream({
      async pull(controller) {
        const buffer = new Uint8Array(1024);
        const size = await tokenizer.readBuffer(buffer, { mayBeLess: true });
        if (size === 0) {
          controller.close();
          return;
        }
        controller.enqueue(buffer.subarray(0, size));
      }
    }).pipeThrough(new DecompressionStream("gzip"));
  }
}
({
  utf8: new globalThis.TextDecoder("utf8")
});
new globalThis.TextEncoder();
Array.from({ length: 256 }, (_, index) => index.toString(16).padStart(2, "0"));
function getUintBE(view) {
  const { byteLength } = view;
  if (byteLength === 6) {
    return view.getUint16(0) * 2 ** 32 + view.getUint32(2);
  }
  if (byteLength === 5) {
    return view.getUint8(0) * 2 ** 32 + view.getUint32(1);
  }
  if (byteLength === 4) {
    return view.getUint32(0);
  }
  if (byteLength === 3) {
    return view.getUint8(0) * 2 ** 16 + view.getUint16(1);
  }
  if (byteLength === 2) {
    return view.getUint16(0);
  }
  if (byteLength === 1) {
    return view.getUint8(0);
  }
}
function stringToBytes(string2, encoding) {
  if (encoding === "utf-16le") {
    const bytes = [];
    for (let index = 0; index < string2.length; index++) {
      const code = string2.charCodeAt(index);
      bytes.push(code & 255, code >> 8 & 255);
    }
    return bytes;
  }
  if (encoding === "utf-16be") {
    const bytes = [];
    for (let index = 0; index < string2.length; index++) {
      const code = string2.charCodeAt(index);
      bytes.push(code >> 8 & 255, code & 255);
    }
    return bytes;
  }
  return [...string2].map((character) => character.charCodeAt(0));
}
function tarHeaderChecksumMatches(arrayBuffer, offset = 0) {
  const readSum = Number.parseInt(new StringType(6).get(arrayBuffer, 148).replace(/\0.*$/, "").trim(), 8);
  if (Number.isNaN(readSum)) {
    return false;
  }
  let sum2 = 8 * 32;
  for (let index = offset; index < offset + 148; index++) {
    sum2 += arrayBuffer[index];
  }
  for (let index = offset + 156; index < offset + 512; index++) {
    sum2 += arrayBuffer[index];
  }
  return readSum === sum2;
}
const uint32SyncSafeToken = {
  get: (buffer, offset) => buffer[offset + 3] & 127 | buffer[offset + 2] << 7 | buffer[offset + 1] << 14 | buffer[offset] << 21,
  len: 4
};
const extensions = [
  "jpg",
  "png",
  "apng",
  "gif",
  "webp",
  "flif",
  "xcf",
  "cr2",
  "cr3",
  "orf",
  "arw",
  "dng",
  "nef",
  "rw2",
  "raf",
  "tif",
  "bmp",
  "icns",
  "jxr",
  "psd",
  "indd",
  "zip",
  "tar",
  "rar",
  "gz",
  "bz2",
  "7z",
  "dmg",
  "mp4",
  "mid",
  "mkv",
  "webm",
  "mov",
  "avi",
  "mpg",
  "mp2",
  "mp3",
  "m4a",
  "oga",
  "ogg",
  "ogv",
  "opus",
  "flac",
  "wav",
  "spx",
  "amr",
  "pdf",
  "epub",
  "elf",
  "macho",
  "exe",
  "swf",
  "rtf",
  "wasm",
  "woff",
  "woff2",
  "eot",
  "ttf",
  "otf",
  "ttc",
  "ico",
  "flv",
  "ps",
  "xz",
  "sqlite",
  "nes",
  "crx",
  "xpi",
  "cab",
  "deb",
  "ar",
  "rpm",
  "Z",
  "lz",
  "cfb",
  "mxf",
  "mts",
  "blend",
  "bpg",
  "docx",
  "pptx",
  "xlsx",
  "3gp",
  "3g2",
  "j2c",
  "jp2",
  "jpm",
  "jpx",
  "mj2",
  "aif",
  "qcp",
  "odt",
  "ods",
  "odp",
  "xml",
  "mobi",
  "heic",
  "cur",
  "ktx",
  "ape",
  "wv",
  "dcm",
  "ics",
  "glb",
  "pcap",
  "dsf",
  "lnk",
  "alias",
  "voc",
  "ac3",
  "m4v",
  "m4p",
  "m4b",
  "f4v",
  "f4p",
  "f4b",
  "f4a",
  "mie",
  "asf",
  "ogm",
  "ogx",
  "mpc",
  "arrow",
  "shp",
  "aac",
  "mp1",
  "it",
  "s3m",
  "xm",
  "skp",
  "avif",
  "eps",
  "lzh",
  "pgp",
  "asar",
  "stl",
  "chm",
  "3mf",
  "zst",
  "jxl",
  "vcf",
  "jls",
  "pst",
  "dwg",
  "parquet",
  "class",
  "arj",
  "cpio",
  "ace",
  "avro",
  "icc",
  "fbx",
  "vsdx",
  "vtt",
  "apk",
  "drc",
  "lz4",
  "potx",
  "xltx",
  "dotx",
  "xltm",
  "ott",
  "ots",
  "otp",
  "odg",
  "otg",
  "xlsm",
  "docm",
  "dotm",
  "potm",
  "pptm",
  "jar",
  "jmp",
  "rm",
  "sav",
  "ppsm",
  "ppsx",
  "tar.gz",
  "reg",
  "dat"
];
const mimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/flif",
  "image/x-xcf",
  "image/x-canon-cr2",
  "image/x-canon-cr3",
  "image/tiff",
  "image/bmp",
  "image/vnd.ms-photo",
  "image/vnd.adobe.photoshop",
  "application/x-indesign",
  "application/epub+zip",
  "application/x-xpinstall",
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
  "application/zip",
  "application/x-tar",
  "application/x-rar-compressed",
  "application/gzip",
  "application/x-bzip2",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/vnd.apache.arrow.file",
  "video/mp4",
  "audio/midi",
  "video/matroska",
  "video/webm",
  "video/quicktime",
  "video/vnd.avi",
  "audio/wav",
  "audio/qcelp",
  "audio/x-ms-asf",
  "video/x-ms-asf",
  "application/vnd.ms-asf",
  "video/mpeg",
  "video/3gpp",
  "audio/mpeg",
  "audio/mp4",
  // RFC 4337
  "video/ogg",
  "audio/ogg",
  "audio/ogg; codecs=opus",
  "application/ogg",
  "audio/flac",
  "audio/ape",
  "audio/wavpack",
  "audio/amr",
  "application/pdf",
  "application/x-elf",
  "application/x-mach-binary",
  "application/x-msdownload",
  "application/x-shockwave-flash",
  "application/rtf",
  "application/wasm",
  "font/woff",
  "font/woff2",
  "application/vnd.ms-fontobject",
  "font/ttf",
  "font/otf",
  "font/collection",
  "image/x-icon",
  "video/x-flv",
  "application/postscript",
  "application/eps",
  "application/x-xz",
  "application/x-sqlite3",
  "application/x-nintendo-nes-rom",
  "application/x-google-chrome-extension",
  "application/vnd.ms-cab-compressed",
  "application/x-deb",
  "application/x-unix-archive",
  "application/x-rpm",
  "application/x-compress",
  "application/x-lzip",
  "application/x-cfb",
  "application/x-mie",
  "application/mxf",
  "video/mp2t",
  "application/x-blender",
  "image/bpg",
  "image/j2c",
  "image/jp2",
  "image/jpx",
  "image/jpm",
  "image/mj2",
  "audio/aiff",
  "application/xml",
  "application/x-mobipocket-ebook",
  "image/heif",
  "image/heif-sequence",
  "image/heic",
  "image/heic-sequence",
  "image/icns",
  "image/ktx",
  "application/dicom",
  "audio/x-musepack",
  "text/calendar",
  "text/vcard",
  "text/vtt",
  "model/gltf-binary",
  "application/vnd.tcpdump.pcap",
  "audio/x-dsf",
  // Non-standard
  "application/x.ms.shortcut",
  // Invented by us
  "application/x.apple.alias",
  // Invented by us
  "audio/x-voc",
  "audio/vnd.dolby.dd-raw",
  "audio/x-m4a",
  "image/apng",
  "image/x-olympus-orf",
  "image/x-sony-arw",
  "image/x-adobe-dng",
  "image/x-nikon-nef",
  "image/x-panasonic-rw2",
  "image/x-fujifilm-raf",
  "video/x-m4v",
  "video/3gpp2",
  "application/x-esri-shape",
  "audio/aac",
  "audio/x-it",
  "audio/x-s3m",
  "audio/x-xm",
  "video/MP1S",
  "video/MP2P",
  "application/vnd.sketchup.skp",
  "image/avif",
  "application/x-lzh-compressed",
  "application/pgp-encrypted",
  "application/x-asar",
  "model/stl",
  "application/vnd.ms-htmlhelp",
  "model/3mf",
  "image/jxl",
  "application/zstd",
  "image/jls",
  "application/vnd.ms-outlook",
  "image/vnd.dwg",
  "application/vnd.apache.parquet",
  "application/java-vm",
  "application/x-arj",
  "application/x-cpio",
  "application/x-ace-compressed",
  "application/avro",
  "application/vnd.iccprofile",
  "application/x.autodesk.fbx",
  // Invented by us
  "application/vnd.visio",
  "application/vnd.android.package-archive",
  "application/vnd.google.draco",
  // Invented by us
  "application/x-lz4",
  // Invented by us
  "application/vnd.openxmlformats-officedocument.presentationml.template",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
  "application/vnd.ms-excel.template.macroenabled.12",
  "application/vnd.oasis.opendocument.text-template",
  "application/vnd.oasis.opendocument.spreadsheet-template",
  "application/vnd.oasis.opendocument.presentation-template",
  "application/vnd.oasis.opendocument.graphics",
  "application/vnd.oasis.opendocument.graphics-template",
  "application/vnd.ms-excel.sheet.macroenabled.12",
  "application/vnd.ms-word.document.macroenabled.12",
  "application/vnd.ms-word.template.macroenabled.12",
  "application/vnd.ms-powerpoint.template.macroenabled.12",
  "application/vnd.ms-powerpoint.presentation.macroenabled.12",
  "application/java-archive",
  "application/vnd.rn-realmedia",
  "application/x-spss-sav",
  "application/x-ms-regedit",
  "application/x-ft-windows-registry-hive",
  "application/x-jmp-data"
];
const reasonableDetectionSizeInBytes = 4100;
const maximumMpegOffsetTolerance = reasonableDetectionSizeInBytes - 2;
const maximumZipEntrySizeInBytes = 1024 * 1024;
const maximumZipEntryCount = 1024;
const maximumZipBufferedReadSizeInBytes = 2 ** 31 - 1;
const maximumUntrustedSkipSizeInBytes = 16 * 1024 * 1024;
const maximumUnknownSizePayloadProbeSizeInBytes = maximumZipEntrySizeInBytes;
const maximumZipTextEntrySizeInBytes = maximumZipEntrySizeInBytes;
const maximumNestedGzipDetectionSizeInBytes = maximumUntrustedSkipSizeInBytes;
const maximumNestedGzipProbeDepth = 1;
const unknownSizeGzipProbeTimeoutInMilliseconds = 100;
const maximumId3HeaderSizeInBytes = maximumUntrustedSkipSizeInBytes;
const maximumEbmlDocumentTypeSizeInBytes = 64;
const maximumEbmlElementPayloadSizeInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
const maximumEbmlElementCount = 256;
const maximumPngChunkCount = 512;
const maximumPngStreamScanBudgetInBytes = maximumUntrustedSkipSizeInBytes;
const maximumAsfHeaderObjectCount = 512;
const maximumTiffTagCount = 512;
const maximumDetectionReentryCount = 256;
const maximumPngChunkSizeInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
const maximumAsfHeaderPayloadSizeInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
const maximumTiffStreamIfdOffsetInBytes = maximumUnknownSizePayloadProbeSizeInBytes;
const maximumTiffIfdOffsetInBytes = maximumUntrustedSkipSizeInBytes;
const recoverableZipErrorMessages = /* @__PURE__ */ new Set([
  "Unexpected signature",
  "Encrypted ZIP",
  "Expected Central-File-Header signature"
]);
const recoverableZipErrorMessagePrefixes = [
  "ZIP entry count exceeds ",
  "Unsupported ZIP compression method:",
  "ZIP entry compressed data exceeds ",
  "ZIP entry decompressed data exceeds ",
  "Expected data-descriptor-signature at position "
];
const recoverableZipErrorCodes = /* @__PURE__ */ new Set([
  "Z_BUF_ERROR",
  "Z_DATA_ERROR",
  "ERR_INVALID_STATE"
]);
class ParserHardLimitError extends Error {
}
function patchWebByobTokenizerClose(tokenizer) {
  const streamReader = tokenizer?.streamReader;
  if (streamReader?.constructor?.name !== "WebStreamByobReader") {
    return tokenizer;
  }
  const { reader } = streamReader;
  const cancelAndRelease = async () => {
    await reader.cancel();
    reader.releaseLock();
  };
  streamReader.close = cancelAndRelease;
  streamReader.abort = async () => {
    streamReader.interrupted = true;
    await cancelAndRelease();
  };
  return tokenizer;
}
function getSafeBound(value, maximum, reason) {
  if (!Number.isFinite(value) || value < 0 || value > maximum) {
    throw new ParserHardLimitError(`${reason} has invalid size ${value} (maximum ${maximum} bytes)`);
  }
  return value;
}
async function safeIgnore(tokenizer, length, { maximumLength = maximumUntrustedSkipSizeInBytes, reason = "skip" } = {}) {
  const safeLength = getSafeBound(length, maximumLength, reason);
  await tokenizer.ignore(safeLength);
}
async function safeReadBuffer(tokenizer, buffer, options, { maximumLength = buffer.length, reason = "read" } = {}) {
  const length = buffer.length;
  const safeLength = getSafeBound(length, maximumLength, reason);
  return tokenizer.readBuffer(buffer, {
    ...options,
    length: safeLength
  });
}
async function decompressDeflateRawWithLimit(data, { maximumLength = maximumZipEntrySizeInBytes } = {}) {
  const input = new ReadableStream({
    start(controller) {
      controller.enqueue(data);
      controller.close();
    }
  });
  const output2 = input.pipeThrough(new DecompressionStream("deflate-raw"));
  const reader = output2.getReader();
  const chunks = [];
  let totalLength = 0;
  try {
    for (; ; ) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      totalLength += value.length;
      if (totalLength > maximumLength) {
        await reader.cancel();
        throw new Error(`ZIP entry decompressed data exceeds ${maximumLength} bytes`);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const uncompressedData = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    uncompressedData.set(chunk, offset);
    offset += chunk.length;
  }
  return uncompressedData;
}
const zipDataDescriptorSignature = 134695760;
const zipDataDescriptorLengthInBytes = 16;
const zipDataDescriptorOverlapLengthInBytes = zipDataDescriptorLengthInBytes - 1;
function findZipDataDescriptorOffset(buffer, bytesConsumed) {
  if (buffer.length < zipDataDescriptorLengthInBytes) {
    return -1;
  }
  const lastPossibleDescriptorOffset = buffer.length - zipDataDescriptorLengthInBytes;
  for (let index = 0; index <= lastPossibleDescriptorOffset; index++) {
    if (UINT32_LE.get(buffer, index) === zipDataDescriptorSignature && UINT32_LE.get(buffer, index + 8) === bytesConsumed + index) {
      return index;
    }
  }
  return -1;
}
function isPngAncillaryChunk(type) {
  return (type.codePointAt(0) & 32) !== 0;
}
function mergeByteChunks(chunks, totalLength) {
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
async function readZipDataDescriptorEntryWithLimit(zipHandler, { shouldBuffer, maximumLength = maximumZipEntrySizeInBytes } = {}) {
  const { syncBuffer } = zipHandler;
  const { length: syncBufferLength } = syncBuffer;
  const chunks = [];
  let bytesConsumed = 0;
  for (; ; ) {
    const length = await zipHandler.tokenizer.peekBuffer(syncBuffer, { mayBeLess: true });
    const dataDescriptorOffset = findZipDataDescriptorOffset(syncBuffer.subarray(0, length), bytesConsumed);
    const retainedLength = dataDescriptorOffset >= 0 ? 0 : length === syncBufferLength ? Math.min(zipDataDescriptorOverlapLengthInBytes, length - 1) : 0;
    const chunkLength = dataDescriptorOffset >= 0 ? dataDescriptorOffset : length - retainedLength;
    if (chunkLength === 0) {
      break;
    }
    bytesConsumed += chunkLength;
    if (bytesConsumed > maximumLength) {
      throw new Error(`ZIP entry compressed data exceeds ${maximumLength} bytes`);
    }
    if (shouldBuffer) {
      const data = new Uint8Array(chunkLength);
      await zipHandler.tokenizer.readBuffer(data);
      chunks.push(data);
    } else {
      await zipHandler.tokenizer.ignore(chunkLength);
    }
    if (dataDescriptorOffset >= 0) {
      break;
    }
  }
  if (!hasUnknownFileSize(zipHandler.tokenizer)) {
    zipHandler.knownSizeDescriptorScannedBytes += bytesConsumed;
  }
  if (!shouldBuffer) {
    return;
  }
  return mergeByteChunks(chunks, bytesConsumed);
}
function getRemainingZipScanBudget(zipHandler, startOffset) {
  if (hasUnknownFileSize(zipHandler.tokenizer)) {
    return Math.max(0, maximumUntrustedSkipSizeInBytes - (zipHandler.tokenizer.position - startOffset));
  }
  return Math.max(0, maximumZipEntrySizeInBytes - zipHandler.knownSizeDescriptorScannedBytes);
}
async function readZipEntryData(zipHandler, zipHeader, { shouldBuffer, maximumDescriptorLength = maximumZipEntrySizeInBytes } = {}) {
  if (zipHeader.dataDescriptor && zipHeader.compressedSize === 0) {
    return readZipDataDescriptorEntryWithLimit(zipHandler, {
      shouldBuffer,
      maximumLength: maximumDescriptorLength
    });
  }
  if (!shouldBuffer) {
    await safeIgnore(zipHandler.tokenizer, zipHeader.compressedSize, {
      maximumLength: hasUnknownFileSize(zipHandler.tokenizer) ? maximumZipEntrySizeInBytes : zipHandler.tokenizer.fileInfo.size,
      reason: "ZIP entry compressed data"
    });
    return;
  }
  const maximumLength = getMaximumZipBufferedReadLength(zipHandler.tokenizer);
  if (!Number.isFinite(zipHeader.compressedSize) || zipHeader.compressedSize < 0 || zipHeader.compressedSize > maximumLength) {
    throw new Error(`ZIP entry compressed data exceeds ${maximumLength} bytes`);
  }
  const fileData = new Uint8Array(zipHeader.compressedSize);
  await zipHandler.tokenizer.readBuffer(fileData);
  return fileData;
}
ZipHandler.prototype.inflate = async function(zipHeader, fileData, callback) {
  if (zipHeader.compressedMethod === 0) {
    return callback(fileData);
  }
  if (zipHeader.compressedMethod !== 8) {
    throw new Error(`Unsupported ZIP compression method: ${zipHeader.compressedMethod}`);
  }
  const uncompressedData = await decompressDeflateRawWithLimit(fileData, { maximumLength: maximumZipEntrySizeInBytes });
  return callback(uncompressedData);
};
ZipHandler.prototype.unzip = async function(fileCallback) {
  let stop = false;
  let zipEntryCount = 0;
  const zipScanStart = this.tokenizer.position;
  this.knownSizeDescriptorScannedBytes = 0;
  do {
    if (hasExceededUnknownSizeScanBudget(this.tokenizer, zipScanStart, maximumUntrustedSkipSizeInBytes)) {
      throw new ParserHardLimitError(`ZIP stream probing exceeds ${maximumUntrustedSkipSizeInBytes} bytes`);
    }
    const zipHeader = await this.readLocalFileHeader();
    if (!zipHeader) {
      break;
    }
    zipEntryCount++;
    if (zipEntryCount > maximumZipEntryCount) {
      throw new Error(`ZIP entry count exceeds ${maximumZipEntryCount}`);
    }
    const next = fileCallback(zipHeader);
    stop = Boolean(next.stop);
    await this.tokenizer.ignore(zipHeader.extraFieldLength);
    const fileData = await readZipEntryData(this, zipHeader, {
      shouldBuffer: Boolean(next.handler),
      maximumDescriptorLength: Math.min(maximumZipEntrySizeInBytes, getRemainingZipScanBudget(this, zipScanStart))
    });
    if (next.handler) {
      await this.inflate(zipHeader, fileData, next.handler);
    }
    if (zipHeader.dataDescriptor) {
      const dataDescriptor = new Uint8Array(zipDataDescriptorLengthInBytes);
      await this.tokenizer.readBuffer(dataDescriptor);
      if (UINT32_LE.get(dataDescriptor, 0) !== zipDataDescriptorSignature) {
        throw new Error(`Expected data-descriptor-signature at position ${this.tokenizer.position - dataDescriptor.length}`);
      }
    }
    if (hasExceededUnknownSizeScanBudget(this.tokenizer, zipScanStart, maximumUntrustedSkipSizeInBytes)) {
      throw new ParserHardLimitError(`ZIP stream probing exceeds ${maximumUntrustedSkipSizeInBytes} bytes`);
    }
  } while (!stop);
};
function createByteLimitedReadableStream(stream, maximumBytes) {
  const reader = stream.getReader();
  let emittedBytes = 0;
  let sourceDone = false;
  let sourceCanceled = false;
  const cancelSource = async (reason) => {
    if (sourceDone || sourceCanceled) {
      return;
    }
    sourceCanceled = true;
    await reader.cancel(reason);
  };
  return new ReadableStream({
    async pull(controller) {
      if (emittedBytes >= maximumBytes) {
        controller.close();
        await cancelSource();
        return;
      }
      const { done, value } = await reader.read();
      if (done || !value) {
        sourceDone = true;
        controller.close();
        return;
      }
      const remainingBytes = maximumBytes - emittedBytes;
      if (value.length > remainingBytes) {
        controller.enqueue(value.subarray(0, remainingBytes));
        emittedBytes += remainingBytes;
        controller.close();
        await cancelSource();
        return;
      }
      controller.enqueue(value);
      emittedBytes += value.length;
    },
    async cancel(reason) {
      await cancelSource(reason);
    }
  });
}
async function fileTypeFromBlob(blob, options) {
  return new FileTypeParser(options).fromBlob(blob);
}
function getFileTypeFromMimeType(mimeType) {
  mimeType = mimeType.toLowerCase();
  switch (mimeType) {
    case "application/epub+zip":
      return {
        ext: "epub",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.text":
      return {
        ext: "odt",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.text-template":
      return {
        ext: "ott",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.spreadsheet":
      return {
        ext: "ods",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.spreadsheet-template":
      return {
        ext: "ots",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.presentation":
      return {
        ext: "odp",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.presentation-template":
      return {
        ext: "otp",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.graphics":
      return {
        ext: "odg",
        mime: mimeType
      };
    case "application/vnd.oasis.opendocument.graphics-template":
      return {
        ext: "otg",
        mime: mimeType
      };
    case "application/vnd.openxmlformats-officedocument.presentationml.slideshow":
      return {
        ext: "ppsx",
        mime: mimeType
      };
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return {
        ext: "xlsx",
        mime: mimeType
      };
    case "application/vnd.ms-excel.sheet.macroenabled":
      return {
        ext: "xlsm",
        mime: "application/vnd.ms-excel.sheet.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.template":
      return {
        ext: "xltx",
        mime: mimeType
      };
    case "application/vnd.ms-excel.template.macroenabled":
      return {
        ext: "xltm",
        mime: "application/vnd.ms-excel.template.macroenabled.12"
      };
    case "application/vnd.ms-powerpoint.slideshow.macroenabled":
      return {
        ext: "ppsm",
        mime: "application/vnd.ms-powerpoint.slideshow.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return {
        ext: "docx",
        mime: mimeType
      };
    case "application/vnd.ms-word.document.macroenabled":
      return {
        ext: "docm",
        mime: "application/vnd.ms-word.document.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.template":
      return {
        ext: "dotx",
        mime: mimeType
      };
    case "application/vnd.ms-word.template.macroenabledtemplate":
      return {
        ext: "dotm",
        mime: "application/vnd.ms-word.template.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.presentationml.template":
      return {
        ext: "potx",
        mime: mimeType
      };
    case "application/vnd.ms-powerpoint.template.macroenabled":
      return {
        ext: "potm",
        mime: "application/vnd.ms-powerpoint.template.macroenabled.12"
      };
    case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      return {
        ext: "pptx",
        mime: mimeType
      };
    case "application/vnd.ms-powerpoint.presentation.macroenabled":
      return {
        ext: "pptm",
        mime: "application/vnd.ms-powerpoint.presentation.macroenabled.12"
      };
    case "application/vnd.ms-visio.drawing":
      return {
        ext: "vsdx",
        mime: "application/vnd.visio"
      };
    case "application/vnd.ms-package.3dmanufacturing-3dmodel+xml":
      return {
        ext: "3mf",
        mime: "model/3mf"
      };
  }
}
function _check(buffer, headers, options) {
  options = {
    offset: 0,
    ...options
  };
  for (const [index, header] of headers.entries()) {
    if (options.mask) {
      if (header !== (options.mask[index] & buffer[index + options.offset])) {
        return false;
      }
    } else if (header !== buffer[index + options.offset]) {
      return false;
    }
  }
  return true;
}
function normalizeSampleSize(sampleSize) {
  if (!Number.isFinite(sampleSize)) {
    return reasonableDetectionSizeInBytes;
  }
  return Math.max(1, Math.trunc(sampleSize));
}
function readByobReaderWithSignal(reader, buffer, signal) {
  if (signal === void 0) {
    return reader.read(buffer);
  }
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      const abortReason = signal.reason;
      cleanup();
      (async () => {
        try {
          await reader.cancel(abortReason);
        } catch {
        }
      })();
      reject(abortReason);
    };
    signal.addEventListener("abort", onAbort, { once: true });
    (async () => {
      try {
        const result = await reader.read(buffer);
        cleanup();
        resolve(result);
      } catch (error) {
        cleanup();
        reject(error);
      }
    })();
  });
}
function normalizeMpegOffsetTolerance(mpegOffsetTolerance) {
  if (!Number.isFinite(mpegOffsetTolerance)) {
    return 0;
  }
  return Math.max(0, Math.min(maximumMpegOffsetTolerance, Math.trunc(mpegOffsetTolerance)));
}
function getKnownFileSizeOrMaximum(fileSize) {
  if (!Number.isFinite(fileSize)) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.max(0, fileSize);
}
function hasUnknownFileSize(tokenizer) {
  const fileSize = tokenizer.fileInfo.size;
  return !Number.isFinite(fileSize) || fileSize === Number.MAX_SAFE_INTEGER;
}
function hasExceededUnknownSizeScanBudget(tokenizer, startOffset, maximumBytes) {
  return hasUnknownFileSize(tokenizer) && tokenizer.position - startOffset > maximumBytes;
}
function getMaximumZipBufferedReadLength(tokenizer) {
  const fileSize = tokenizer.fileInfo.size;
  const remainingBytes = Number.isFinite(fileSize) ? Math.max(0, fileSize - tokenizer.position) : Number.MAX_SAFE_INTEGER;
  return Math.min(remainingBytes, maximumZipBufferedReadSizeInBytes);
}
function isRecoverableZipError(error) {
  if (error instanceof EndOfStreamError) {
    return true;
  }
  if (error instanceof ParserHardLimitError) {
    return true;
  }
  if (!(error instanceof Error)) {
    return false;
  }
  if (recoverableZipErrorMessages.has(error.message)) {
    return true;
  }
  if (recoverableZipErrorCodes.has(error.code)) {
    return true;
  }
  for (const prefix of recoverableZipErrorMessagePrefixes) {
    if (error.message.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}
function canReadZipEntryForDetection(zipHeader, maximumSize = maximumZipEntrySizeInBytes) {
  const sizes = [zipHeader.compressedSize, zipHeader.uncompressedSize];
  for (const size of sizes) {
    if (!Number.isFinite(size) || size < 0 || size > maximumSize) {
      return false;
    }
  }
  return true;
}
function createOpenXmlZipDetectionState() {
  return {
    hasContentTypesEntry: false,
    hasParsedContentTypesEntry: false,
    isParsingContentTypes: false,
    hasUnparseableContentTypes: false,
    hasWordDirectory: false,
    hasPresentationDirectory: false,
    hasSpreadsheetDirectory: false,
    hasThreeDimensionalModelEntry: false
  };
}
function updateOpenXmlZipDetectionStateFromFilename(openXmlState, filename) {
  if (filename.startsWith("word/")) {
    openXmlState.hasWordDirectory = true;
  }
  if (filename.startsWith("ppt/")) {
    openXmlState.hasPresentationDirectory = true;
  }
  if (filename.startsWith("xl/")) {
    openXmlState.hasSpreadsheetDirectory = true;
  }
  if (filename.startsWith("3D/") && filename.endsWith(".model")) {
    openXmlState.hasThreeDimensionalModelEntry = true;
  }
}
function getOpenXmlFileTypeFromZipEntries(openXmlState) {
  if (!openXmlState.hasContentTypesEntry || openXmlState.hasUnparseableContentTypes || openXmlState.isParsingContentTypes || openXmlState.hasParsedContentTypesEntry) {
    return;
  }
  if (openXmlState.hasWordDirectory) {
    return {
      ext: "docx",
      mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
  }
  if (openXmlState.hasPresentationDirectory) {
    return {
      ext: "pptx",
      mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    };
  }
  if (openXmlState.hasSpreadsheetDirectory) {
    return {
      ext: "xlsx",
      mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    };
  }
  if (openXmlState.hasThreeDimensionalModelEntry) {
    return {
      ext: "3mf",
      mime: "model/3mf"
    };
  }
}
function getOpenXmlMimeTypeFromContentTypesXml(xmlContent) {
  const endPosition = xmlContent.indexOf('.main+xml"');
  if (endPosition === -1) {
    const mimeType = "application/vnd.ms-package.3dmanufacturing-3dmodel+xml";
    if (xmlContent.includes(`ContentType="${mimeType}"`)) {
      return mimeType;
    }
    return;
  }
  const truncatedContent = xmlContent.slice(0, endPosition);
  const firstQuotePosition = truncatedContent.lastIndexOf('"');
  return truncatedContent.slice(firstQuotePosition + 1);
}
class FileTypeParser {
  constructor(options) {
    const normalizedMpegOffsetTolerance = normalizeMpegOffsetTolerance(options?.mpegOffsetTolerance);
    this.options = {
      ...options,
      mpegOffsetTolerance: normalizedMpegOffsetTolerance
    };
    this.detectors = [
      ...this.options.customDetectors ?? [],
      { id: "core", detect: this.detectConfident },
      { id: "core.imprecise", detect: this.detectImprecise }
    ];
    this.tokenizerOptions = {
      abortSignal: this.options.signal
    };
    this.gzipProbeDepth = 0;
  }
  getTokenizerOptions() {
    return {
      ...this.tokenizerOptions
    };
  }
  createTokenizerFromWebStream(stream) {
    return patchWebByobTokenizerClose(fromWebStream(stream, this.getTokenizerOptions()));
  }
  async parseTokenizer(tokenizer, detectionReentryCount = 0) {
    this.detectionReentryCount = detectionReentryCount;
    const initialPosition = tokenizer.position;
    for (const detector of this.detectors) {
      let fileType;
      try {
        fileType = await detector.detect(tokenizer);
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        if (error instanceof ParserHardLimitError) {
          return;
        }
        throw error;
      }
      if (fileType) {
        return fileType;
      }
      if (initialPosition !== tokenizer.position) {
        return void 0;
      }
    }
  }
  async fromTokenizer(tokenizer) {
    try {
      return await this.parseTokenizer(tokenizer);
    } finally {
      await tokenizer.close();
    }
  }
  async fromBuffer(input) {
    if (!(input instanceof Uint8Array || input instanceof ArrayBuffer)) {
      throw new TypeError(`Expected the \`input\` argument to be of type \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof input}\``);
    }
    const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);
    if (!(buffer?.length > 1)) {
      return;
    }
    return this.fromTokenizer(fromBuffer(buffer, this.getTokenizerOptions()));
  }
  async fromBlob(blob) {
    this.options.signal?.throwIfAborted();
    const tokenizer = fromBlob(blob, this.getTokenizerOptions());
    return this.fromTokenizer(tokenizer);
  }
  async fromStream(stream) {
    this.options.signal?.throwIfAborted();
    const tokenizer = this.createTokenizerFromWebStream(stream);
    return this.fromTokenizer(tokenizer);
  }
  async toDetectionStream(stream, options) {
    const sampleSize = normalizeSampleSize(options?.sampleSize ?? reasonableDetectionSizeInBytes);
    let detectedFileType;
    let firstChunk;
    const reader = stream.getReader({ mode: "byob" });
    try {
      const { value: chunk, done } = await readByobReaderWithSignal(reader, new Uint8Array(sampleSize), this.options.signal);
      firstChunk = chunk;
      if (!done && chunk) {
        try {
          detectedFileType = await this.fromBuffer(chunk.subarray(0, sampleSize));
        } catch (error) {
          if (!(error instanceof EndOfStreamError)) {
            throw error;
          }
          detectedFileType = void 0;
        }
      }
      firstChunk = chunk;
    } finally {
      reader.releaseLock();
    }
    const transformStream = new TransformStream({
      async start(controller) {
        controller.enqueue(firstChunk);
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      }
    });
    const newStream = stream.pipeThrough(transformStream);
    newStream.fileType = detectedFileType;
    return newStream;
  }
  async detectGzip(tokenizer) {
    if (this.gzipProbeDepth >= maximumNestedGzipProbeDepth) {
      return {
        ext: "gz",
        mime: "application/gzip"
      };
    }
    const gzipHandler = new GzipHandler(tokenizer);
    const limitedInflatedStream = createByteLimitedReadableStream(gzipHandler.inflate(), maximumNestedGzipDetectionSizeInBytes);
    const hasUnknownSize = hasUnknownFileSize(tokenizer);
    let timeout;
    let probeSignal;
    let probeParser;
    let compressedFileType;
    if (hasUnknownSize) {
      const timeoutController = new AbortController();
      timeout = setTimeout(() => {
        timeoutController.abort(new DOMException(`Operation timed out after ${unknownSizeGzipProbeTimeoutInMilliseconds} ms`, "TimeoutError"));
      }, unknownSizeGzipProbeTimeoutInMilliseconds);
      probeSignal = this.options.signal === void 0 ? timeoutController.signal : AbortSignal.any([this.options.signal, timeoutController.signal]);
      probeParser = new FileTypeParser({
        ...this.options,
        signal: probeSignal
      });
      probeParser.gzipProbeDepth = this.gzipProbeDepth + 1;
    } else {
      this.gzipProbeDepth++;
    }
    try {
      compressedFileType = await (probeParser ?? this).fromStream(limitedInflatedStream);
    } catch (error) {
      if (error?.name === "AbortError" && probeSignal?.reason?.name !== "TimeoutError") {
        throw error;
      }
    } finally {
      clearTimeout(timeout);
      if (!hasUnknownSize) {
        this.gzipProbeDepth--;
      }
    }
    if (compressedFileType?.ext === "tar") {
      return {
        ext: "tar.gz",
        mime: "application/gzip"
      };
    }
    return {
      ext: "gz",
      mime: "application/gzip"
    };
  }
  check(header, options) {
    return _check(this.buffer, header, options);
  }
  checkString(header, options) {
    return this.check(stringToBytes(header, options?.encoding), options);
  }
  // Detections with a high degree of certainty in identifying the correct file type
  detectConfident = async (tokenizer) => {
    this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);
    if (tokenizer.fileInfo.size === void 0) {
      tokenizer.fileInfo.size = Number.MAX_SAFE_INTEGER;
    }
    this.tokenizer = tokenizer;
    if (hasUnknownFileSize(tokenizer)) {
      await tokenizer.peekBuffer(this.buffer, { length: 3, mayBeLess: true });
      if (this.check([31, 139, 8])) {
        return this.detectGzip(tokenizer);
      }
    }
    await tokenizer.peekBuffer(this.buffer, { length: 32, mayBeLess: true });
    if (this.check([66, 77])) {
      return {
        ext: "bmp",
        mime: "image/bmp"
      };
    }
    if (this.check([11, 119])) {
      return {
        ext: "ac3",
        mime: "audio/vnd.dolby.dd-raw"
      };
    }
    if (this.check([120, 1])) {
      return {
        ext: "dmg",
        mime: "application/x-apple-diskimage"
      };
    }
    if (this.check([77, 90])) {
      return {
        ext: "exe",
        mime: "application/x-msdownload"
      };
    }
    if (this.check([37, 33])) {
      await tokenizer.peekBuffer(this.buffer, { length: 24, mayBeLess: true });
      if (this.checkString("PS-Adobe-", { offset: 2 }) && this.checkString(" EPSF-", { offset: 14 })) {
        return {
          ext: "eps",
          mime: "application/eps"
        };
      }
      return {
        ext: "ps",
        mime: "application/postscript"
      };
    }
    if (this.check([31, 160]) || this.check([31, 157])) {
      return {
        ext: "Z",
        mime: "application/x-compress"
      };
    }
    if (this.check([199, 113])) {
      return {
        ext: "cpio",
        mime: "application/x-cpio"
      };
    }
    if (this.check([96, 234])) {
      return {
        ext: "arj",
        mime: "application/x-arj"
      };
    }
    if (this.check([239, 187, 191])) {
      if (this.detectionReentryCount >= maximumDetectionReentryCount) {
        return;
      }
      this.detectionReentryCount++;
      await this.tokenizer.ignore(3);
      return this.detectConfident(tokenizer);
    }
    if (this.check([71, 73, 70])) {
      return {
        ext: "gif",
        mime: "image/gif"
      };
    }
    if (this.check([73, 73, 188])) {
      return {
        ext: "jxr",
        mime: "image/vnd.ms-photo"
      };
    }
    if (this.check([31, 139, 8])) {
      return this.detectGzip(tokenizer);
    }
    if (this.check([66, 90, 104])) {
      return {
        ext: "bz2",
        mime: "application/x-bzip2"
      };
    }
    if (this.checkString("ID3")) {
      await safeIgnore(tokenizer, 6, {
        maximumLength: 6,
        reason: "ID3 header prefix"
      });
      const id3HeaderLength = await tokenizer.readToken(uint32SyncSafeToken);
      const isUnknownFileSize = hasUnknownFileSize(tokenizer);
      if (!Number.isFinite(id3HeaderLength) || id3HeaderLength < 0 || isUnknownFileSize && (id3HeaderLength > maximumId3HeaderSizeInBytes || tokenizer.position + id3HeaderLength > maximumId3HeaderSizeInBytes)) {
        return;
      }
      if (tokenizer.position + id3HeaderLength > tokenizer.fileInfo.size) {
        if (isUnknownFileSize) {
          return;
        }
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      }
      try {
        await safeIgnore(tokenizer, id3HeaderLength, {
          maximumLength: isUnknownFileSize ? maximumId3HeaderSizeInBytes : tokenizer.fileInfo.size,
          reason: "ID3 payload"
        });
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        throw error;
      }
      if (this.detectionReentryCount >= maximumDetectionReentryCount) {
        return;
      }
      this.detectionReentryCount++;
      return this.parseTokenizer(tokenizer, this.detectionReentryCount);
    }
    if (this.checkString("MP+")) {
      return {
        ext: "mpc",
        mime: "audio/x-musepack"
      };
    }
    if ((this.buffer[0] === 67 || this.buffer[0] === 70) && this.check([87, 83], { offset: 1 })) {
      return {
        ext: "swf",
        mime: "application/x-shockwave-flash"
      };
    }
    if (this.check([255, 216, 255])) {
      if (this.check([247], { offset: 3 })) {
        return {
          ext: "jls",
          mime: "image/jls"
        };
      }
      return {
        ext: "jpg",
        mime: "image/jpeg"
      };
    }
    if (this.check([79, 98, 106, 1])) {
      return {
        ext: "avro",
        mime: "application/avro"
      };
    }
    if (this.checkString("FLIF")) {
      return {
        ext: "flif",
        mime: "image/flif"
      };
    }
    if (this.checkString("8BPS")) {
      return {
        ext: "psd",
        mime: "image/vnd.adobe.photoshop"
      };
    }
    if (this.checkString("MPCK")) {
      return {
        ext: "mpc",
        mime: "audio/x-musepack"
      };
    }
    if (this.checkString("FORM")) {
      return {
        ext: "aif",
        mime: "audio/aiff"
      };
    }
    if (this.checkString("icns", { offset: 0 })) {
      return {
        ext: "icns",
        mime: "image/icns"
      };
    }
    if (this.check([80, 75, 3, 4])) {
      let fileType;
      const openXmlState = createOpenXmlZipDetectionState();
      try {
        await new ZipHandler(tokenizer).unzip((zipHeader) => {
          updateOpenXmlZipDetectionStateFromFilename(openXmlState, zipHeader.filename);
          const isOpenXmlContentTypesEntry = zipHeader.filename === "[Content_Types].xml";
          const openXmlFileTypeFromEntries = getOpenXmlFileTypeFromZipEntries(openXmlState);
          if (!isOpenXmlContentTypesEntry && openXmlFileTypeFromEntries) {
            fileType = openXmlFileTypeFromEntries;
            return {
              stop: true
            };
          }
          switch (zipHeader.filename) {
            case "META-INF/mozilla.rsa":
              fileType = {
                ext: "xpi",
                mime: "application/x-xpinstall"
              };
              return {
                stop: true
              };
            case "META-INF/MANIFEST.MF":
              fileType = {
                ext: "jar",
                mime: "application/java-archive"
              };
              return {
                stop: true
              };
            case "mimetype":
              if (!canReadZipEntryForDetection(zipHeader, maximumZipTextEntrySizeInBytes)) {
                return {};
              }
              return {
                async handler(fileData) {
                  const mimeType = new TextDecoder("utf-8").decode(fileData).trim();
                  fileType = getFileTypeFromMimeType(mimeType);
                },
                stop: true
              };
            case "[Content_Types].xml": {
              openXmlState.hasContentTypesEntry = true;
              if (!canReadZipEntryForDetection(zipHeader, maximumZipTextEntrySizeInBytes)) {
                openXmlState.hasUnparseableContentTypes = true;
                return {};
              }
              openXmlState.isParsingContentTypes = true;
              return {
                async handler(fileData) {
                  const xmlContent = new TextDecoder("utf-8").decode(fileData);
                  const mimeType = getOpenXmlMimeTypeFromContentTypesXml(xmlContent);
                  if (mimeType) {
                    fileType = getFileTypeFromMimeType(mimeType);
                  }
                  openXmlState.hasParsedContentTypesEntry = true;
                  openXmlState.isParsingContentTypes = false;
                },
                stop: true
              };
            }
            default:
              if (/classes\d*\.dex/.test(zipHeader.filename)) {
                fileType = {
                  ext: "apk",
                  mime: "application/vnd.android.package-archive"
                };
                return { stop: true };
              }
              return {};
          }
        });
      } catch (error) {
        if (!isRecoverableZipError(error)) {
          throw error;
        }
        if (openXmlState.isParsingContentTypes) {
          openXmlState.isParsingContentTypes = false;
          openXmlState.hasUnparseableContentTypes = true;
        }
      }
      return fileType ?? getOpenXmlFileTypeFromZipEntries(openXmlState) ?? {
        ext: "zip",
        mime: "application/zip"
      };
    }
    if (this.checkString("OggS")) {
      await tokenizer.ignore(28);
      const type = new Uint8Array(8);
      await tokenizer.readBuffer(type);
      if (_check(type, [79, 112, 117, 115, 72, 101, 97, 100])) {
        return {
          ext: "opus",
          mime: "audio/ogg; codecs=opus"
        };
      }
      if (_check(type, [128, 116, 104, 101, 111, 114, 97])) {
        return {
          ext: "ogv",
          mime: "video/ogg"
        };
      }
      if (_check(type, [1, 118, 105, 100, 101, 111, 0])) {
        return {
          ext: "ogm",
          mime: "video/ogg"
        };
      }
      if (_check(type, [127, 70, 76, 65, 67])) {
        return {
          ext: "oga",
          mime: "audio/ogg"
        };
      }
      if (_check(type, [83, 112, 101, 101, 120, 32, 32])) {
        return {
          ext: "spx",
          mime: "audio/ogg"
        };
      }
      if (_check(type, [1, 118, 111, 114, 98, 105, 115])) {
        return {
          ext: "ogg",
          mime: "audio/ogg"
        };
      }
      return {
        ext: "ogx",
        mime: "application/ogg"
      };
    }
    if (this.check([80, 75]) && (this.buffer[2] === 3 || this.buffer[2] === 5 || this.buffer[2] === 7) && (this.buffer[3] === 4 || this.buffer[3] === 6 || this.buffer[3] === 8)) {
      return {
        ext: "zip",
        mime: "application/zip"
      };
    }
    if (this.checkString("MThd")) {
      return {
        ext: "mid",
        mime: "audio/midi"
      };
    }
    if (this.checkString("wOFF") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 }))) {
      return {
        ext: "woff",
        mime: "font/woff"
      };
    }
    if (this.checkString("wOF2") && (this.check([0, 1, 0, 0], { offset: 4 }) || this.checkString("OTTO", { offset: 4 }))) {
      return {
        ext: "woff2",
        mime: "font/woff2"
      };
    }
    if (this.check([212, 195, 178, 161]) || this.check([161, 178, 195, 212])) {
      return {
        ext: "pcap",
        mime: "application/vnd.tcpdump.pcap"
      };
    }
    if (this.checkString("DSD ")) {
      return {
        ext: "dsf",
        mime: "audio/x-dsf"
        // Non-standard
      };
    }
    if (this.checkString("LZIP")) {
      return {
        ext: "lz",
        mime: "application/x-lzip"
      };
    }
    if (this.checkString("fLaC")) {
      return {
        ext: "flac",
        mime: "audio/flac"
      };
    }
    if (this.check([66, 80, 71, 251])) {
      return {
        ext: "bpg",
        mime: "image/bpg"
      };
    }
    if (this.checkString("wvpk")) {
      return {
        ext: "wv",
        mime: "audio/wavpack"
      };
    }
    if (this.checkString("%PDF")) {
      return {
        ext: "pdf",
        mime: "application/pdf"
      };
    }
    if (this.check([0, 97, 115, 109])) {
      return {
        ext: "wasm",
        mime: "application/wasm"
      };
    }
    if (this.check([73, 73])) {
      const fileType = await this.readTiffHeader(false);
      if (fileType) {
        return fileType;
      }
    }
    if (this.check([77, 77])) {
      const fileType = await this.readTiffHeader(true);
      if (fileType) {
        return fileType;
      }
    }
    if (this.checkString("MAC ")) {
      return {
        ext: "ape",
        mime: "audio/ape"
      };
    }
    if (this.check([26, 69, 223, 163])) {
      async function readField() {
        const msb = await tokenizer.peekNumber(UINT8);
        let mask = 128;
        let ic = 0;
        while ((msb & mask) === 0 && mask !== 0) {
          ++ic;
          mask >>= 1;
        }
        const id = new Uint8Array(ic + 1);
        await safeReadBuffer(tokenizer, id, void 0, {
          maximumLength: id.length,
          reason: "EBML field"
        });
        return id;
      }
      async function readElement() {
        const idField = await readField();
        const lengthField = await readField();
        lengthField[0] ^= 128 >> lengthField.length - 1;
        const nrLength = Math.min(6, lengthField.length);
        const idView = new DataView(idField.buffer);
        const lengthView = new DataView(lengthField.buffer, lengthField.length - nrLength, nrLength);
        return {
          id: getUintBE(idView),
          len: getUintBE(lengthView)
        };
      }
      async function readChildren(children) {
        let ebmlElementCount = 0;
        while (children > 0) {
          ebmlElementCount++;
          if (ebmlElementCount > maximumEbmlElementCount) {
            return;
          }
          if (hasExceededUnknownSizeScanBudget(tokenizer, ebmlScanStart, maximumUntrustedSkipSizeInBytes)) {
            return;
          }
          const previousPosition = tokenizer.position;
          const element = await readElement();
          if (element.id === 17026) {
            if (element.len > maximumEbmlDocumentTypeSizeInBytes) {
              return;
            }
            const documentTypeLength = getSafeBound(element.len, maximumEbmlDocumentTypeSizeInBytes, "EBML DocType");
            const rawValue = await tokenizer.readToken(new StringType(documentTypeLength));
            return rawValue.replaceAll(/\00.*$/g, "");
          }
          if (hasUnknownFileSize(tokenizer) && (!Number.isFinite(element.len) || element.len < 0 || element.len > maximumEbmlElementPayloadSizeInBytes)) {
            return;
          }
          await safeIgnore(tokenizer, element.len, {
            maximumLength: hasUnknownFileSize(tokenizer) ? maximumEbmlElementPayloadSizeInBytes : tokenizer.fileInfo.size,
            reason: "EBML payload"
          });
          --children;
          if (tokenizer.position <= previousPosition) {
            return;
          }
        }
      }
      const rootElement = await readElement();
      const ebmlScanStart = tokenizer.position;
      const documentType = await readChildren(rootElement.len);
      switch (documentType) {
        case "webm":
          return {
            ext: "webm",
            mime: "video/webm"
          };
        case "matroska":
          return {
            ext: "mkv",
            mime: "video/matroska"
          };
        default:
          return;
      }
    }
    if (this.checkString("SQLi")) {
      return {
        ext: "sqlite",
        mime: "application/x-sqlite3"
      };
    }
    if (this.check([78, 69, 83, 26])) {
      return {
        ext: "nes",
        mime: "application/x-nintendo-nes-rom"
      };
    }
    if (this.checkString("Cr24")) {
      return {
        ext: "crx",
        mime: "application/x-google-chrome-extension"
      };
    }
    if (this.checkString("MSCF") || this.checkString("ISc(")) {
      return {
        ext: "cab",
        mime: "application/vnd.ms-cab-compressed"
      };
    }
    if (this.check([237, 171, 238, 219])) {
      return {
        ext: "rpm",
        mime: "application/x-rpm"
      };
    }
    if (this.check([197, 208, 211, 198])) {
      return {
        ext: "eps",
        mime: "application/eps"
      };
    }
    if (this.check([40, 181, 47, 253])) {
      return {
        ext: "zst",
        mime: "application/zstd"
      };
    }
    if (this.check([127, 69, 76, 70])) {
      return {
        ext: "elf",
        mime: "application/x-elf"
      };
    }
    if (this.check([33, 66, 68, 78])) {
      return {
        ext: "pst",
        mime: "application/vnd.ms-outlook"
      };
    }
    if (this.checkString("PAR1") || this.checkString("PARE")) {
      return {
        ext: "parquet",
        mime: "application/vnd.apache.parquet"
      };
    }
    if (this.checkString("ttcf")) {
      return {
        ext: "ttc",
        mime: "font/collection"
      };
    }
    if (this.check([254, 237, 250, 206]) || this.check([254, 237, 250, 207]) || this.check([206, 250, 237, 254]) || this.check([207, 250, 237, 254])) {
      return {
        ext: "macho",
        mime: "application/x-mach-binary"
      };
    }
    if (this.check([4, 34, 77, 24])) {
      return {
        ext: "lz4",
        mime: "application/x-lz4"
        // Invented by us
      };
    }
    if (this.checkString("regf")) {
      return {
        ext: "dat",
        mime: "application/x-ft-windows-registry-hive"
      };
    }
    if (this.checkString("$FL2") || this.checkString("$FL3")) {
      return {
        ext: "sav",
        mime: "application/x-spss-sav"
      };
    }
    if (this.check([79, 84, 84, 79, 0])) {
      return {
        ext: "otf",
        mime: "font/otf"
      };
    }
    if (this.checkString("#!AMR")) {
      return {
        ext: "amr",
        mime: "audio/amr"
      };
    }
    if (this.checkString("{\\rtf")) {
      return {
        ext: "rtf",
        mime: "application/rtf"
      };
    }
    if (this.check([70, 76, 86, 1])) {
      return {
        ext: "flv",
        mime: "video/x-flv"
      };
    }
    if (this.checkString("IMPM")) {
      return {
        ext: "it",
        mime: "audio/x-it"
      };
    }
    if (this.checkString("-lh0-", { offset: 2 }) || this.checkString("-lh1-", { offset: 2 }) || this.checkString("-lh2-", { offset: 2 }) || this.checkString("-lh3-", { offset: 2 }) || this.checkString("-lh4-", { offset: 2 }) || this.checkString("-lh5-", { offset: 2 }) || this.checkString("-lh6-", { offset: 2 }) || this.checkString("-lh7-", { offset: 2 }) || this.checkString("-lzs-", { offset: 2 }) || this.checkString("-lz4-", { offset: 2 }) || this.checkString("-lz5-", { offset: 2 }) || this.checkString("-lhd-", { offset: 2 })) {
      return {
        ext: "lzh",
        mime: "application/x-lzh-compressed"
      };
    }
    if (this.check([0, 0, 1, 186])) {
      if (this.check([33], { offset: 4, mask: [241] })) {
        return {
          ext: "mpg",
          // May also be .ps, .mpeg
          mime: "video/MP1S"
        };
      }
      if (this.check([68], { offset: 4, mask: [196] })) {
        return {
          ext: "mpg",
          // May also be .mpg, .m2p, .vob or .sub
          mime: "video/MP2P"
        };
      }
    }
    if (this.checkString("ITSF")) {
      return {
        ext: "chm",
        mime: "application/vnd.ms-htmlhelp"
      };
    }
    if (this.check([202, 254, 186, 190])) {
      const machOArchitectureCount = UINT32_BE.get(this.buffer, 4);
      const javaClassFileMajorVersion = UINT16_BE.get(this.buffer, 6);
      if (machOArchitectureCount > 0 && machOArchitectureCount <= 30) {
        return {
          ext: "macho",
          mime: "application/x-mach-binary"
        };
      }
      if (javaClassFileMajorVersion > 30) {
        return {
          ext: "class",
          mime: "application/java-vm"
        };
      }
    }
    if (this.checkString(".RMF")) {
      return {
        ext: "rm",
        mime: "application/vnd.rn-realmedia"
      };
    }
    if (this.checkString("DRACO")) {
      return {
        ext: "drc",
        mime: "application/vnd.google.draco"
        // Invented by us
      };
    }
    if (this.check([253, 55, 122, 88, 90, 0])) {
      return {
        ext: "xz",
        mime: "application/x-xz"
      };
    }
    if (this.checkString("<?xml ")) {
      return {
        ext: "xml",
        mime: "application/xml"
      };
    }
    if (this.check([55, 122, 188, 175, 39, 28])) {
      return {
        ext: "7z",
        mime: "application/x-7z-compressed"
      };
    }
    if (this.check([82, 97, 114, 33, 26, 7]) && (this.buffer[6] === 0 || this.buffer[6] === 1)) {
      return {
        ext: "rar",
        mime: "application/x-rar-compressed"
      };
    }
    if (this.checkString("solid ")) {
      return {
        ext: "stl",
        mime: "model/stl"
      };
    }
    if (this.checkString("AC")) {
      const version = new StringType(4, "latin1").get(this.buffer, 2);
      if (version.match("^d*") && version >= 1e3 && version <= 1050) {
        return {
          ext: "dwg",
          mime: "image/vnd.dwg"
        };
      }
    }
    if (this.checkString("070707")) {
      return {
        ext: "cpio",
        mime: "application/x-cpio"
      };
    }
    if (this.checkString("BLENDER")) {
      return {
        ext: "blend",
        mime: "application/x-blender"
      };
    }
    if (this.checkString("!<arch>")) {
      await tokenizer.ignore(8);
      const string2 = await tokenizer.readToken(new StringType(13, "ascii"));
      if (string2 === "debian-binary") {
        return {
          ext: "deb",
          mime: "application/x-deb"
        };
      }
      return {
        ext: "ar",
        mime: "application/x-unix-archive"
      };
    }
    if (this.checkString("WEBVTT") && // One of LF, CR, tab, space, or end of file must follow "WEBVTT" per the spec (see `fixture/fixture-vtt-*.vtt` for examples). Note that `\0` is technically the null character (there is no such thing as an EOF character). However, checking for `\0` gives us the same result as checking for the end of the stream.
    ["\n", "\r", "	", " ", "\0"].some((char7) => this.checkString(char7, { offset: 6 }))) {
      return {
        ext: "vtt",
        mime: "text/vtt"
      };
    }
    if (this.check([137, 80, 78, 71, 13, 10, 26, 10])) {
      const pngFileType = {
        ext: "png",
        mime: "image/png"
      };
      const apngFileType = {
        ext: "apng",
        mime: "image/apng"
      };
      await tokenizer.ignore(8);
      async function readChunkHeader() {
        return {
          length: await tokenizer.readToken(INT32_BE),
          type: await tokenizer.readToken(new StringType(4, "latin1"))
        };
      }
      const isUnknownPngStream = hasUnknownFileSize(tokenizer);
      const pngScanStart = tokenizer.position;
      let pngChunkCount = 0;
      let hasSeenImageHeader = false;
      do {
        pngChunkCount++;
        if (pngChunkCount > maximumPngChunkCount) {
          break;
        }
        if (hasExceededUnknownSizeScanBudget(tokenizer, pngScanStart, maximumPngStreamScanBudgetInBytes)) {
          break;
        }
        const previousPosition = tokenizer.position;
        const chunk = await readChunkHeader();
        if (chunk.length < 0) {
          return;
        }
        if (chunk.type === "IHDR") {
          if (chunk.length !== 13) {
            return;
          }
          hasSeenImageHeader = true;
        }
        switch (chunk.type) {
          case "IDAT":
            return pngFileType;
          case "acTL":
            return apngFileType;
          default:
            if (!hasSeenImageHeader && chunk.type !== "CgBI") {
              return;
            }
            if (isUnknownPngStream && chunk.length > maximumPngChunkSizeInBytes) {
              return hasSeenImageHeader && isPngAncillaryChunk(chunk.type) ? pngFileType : void 0;
            }
            try {
              await safeIgnore(tokenizer, chunk.length + 4, {
                maximumLength: isUnknownPngStream ? maximumPngChunkSizeInBytes + 4 : tokenizer.fileInfo.size,
                reason: "PNG chunk payload"
              });
            } catch (error) {
              if (!isUnknownPngStream && (error instanceof ParserHardLimitError || error instanceof EndOfStreamError)) {
                return pngFileType;
              }
              throw error;
            }
        }
        if (tokenizer.position <= previousPosition) {
          break;
        }
      } while (tokenizer.position + 8 < tokenizer.fileInfo.size);
      return pngFileType;
    }
    if (this.check([65, 82, 82, 79, 87, 49, 0, 0])) {
      return {
        ext: "arrow",
        mime: "application/vnd.apache.arrow.file"
      };
    }
    if (this.check([103, 108, 84, 70, 2, 0, 0, 0])) {
      return {
        ext: "glb",
        mime: "model/gltf-binary"
      };
    }
    if (this.check([102, 114, 101, 101], { offset: 4 }) || this.check([109, 100, 97, 116], { offset: 4 }) || this.check([109, 111, 111, 118], { offset: 4 }) || this.check([119, 105, 100, 101], { offset: 4 })) {
      return {
        ext: "mov",
        mime: "video/quicktime"
      };
    }
    if (this.check([73, 73, 82, 79, 8, 0, 0, 0, 24])) {
      return {
        ext: "orf",
        mime: "image/x-olympus-orf"
      };
    }
    if (this.checkString("gimp xcf ")) {
      return {
        ext: "xcf",
        mime: "image/x-xcf"
      };
    }
    if (this.checkString("ftyp", { offset: 4 }) && (this.buffer[8] & 96) !== 0) {
      const brandMajor = new StringType(4, "latin1").get(this.buffer, 8).replace("\0", " ").trim();
      switch (brandMajor) {
        case "avif":
        case "avis":
          return { ext: "avif", mime: "image/avif" };
        case "mif1":
          return { ext: "heic", mime: "image/heif" };
        case "msf1":
          return { ext: "heic", mime: "image/heif-sequence" };
        case "heic":
        case "heix":
          return { ext: "heic", mime: "image/heic" };
        case "hevc":
        case "hevx":
          return { ext: "heic", mime: "image/heic-sequence" };
        case "qt":
          return { ext: "mov", mime: "video/quicktime" };
        case "M4V":
        case "M4VH":
        case "M4VP":
          return { ext: "m4v", mime: "video/x-m4v" };
        case "M4P":
          return { ext: "m4p", mime: "video/mp4" };
        case "M4B":
          return { ext: "m4b", mime: "audio/mp4" };
        case "M4A":
          return { ext: "m4a", mime: "audio/x-m4a" };
        case "F4V":
          return { ext: "f4v", mime: "video/mp4" };
        case "F4P":
          return { ext: "f4p", mime: "video/mp4" };
        case "F4A":
          return { ext: "f4a", mime: "audio/mp4" };
        case "F4B":
          return { ext: "f4b", mime: "audio/mp4" };
        case "crx":
          return { ext: "cr3", mime: "image/x-canon-cr3" };
        default:
          if (brandMajor.startsWith("3g")) {
            if (brandMajor.startsWith("3g2")) {
              return { ext: "3g2", mime: "video/3gpp2" };
            }
            return { ext: "3gp", mime: "video/3gpp" };
          }
          return { ext: "mp4", mime: "video/mp4" };
      }
    }
    if (this.checkString("REGEDIT4\r\n")) {
      return {
        ext: "reg",
        mime: "application/x-ms-regedit"
      };
    }
    if (this.check([82, 73, 70, 70])) {
      if (this.checkString("WEBP", { offset: 8 })) {
        return {
          ext: "webp",
          mime: "image/webp"
        };
      }
      if (this.check([65, 86, 73], { offset: 8 })) {
        return {
          ext: "avi",
          mime: "video/vnd.avi"
        };
      }
      if (this.check([87, 65, 86, 69], { offset: 8 })) {
        return {
          ext: "wav",
          mime: "audio/wav"
        };
      }
      if (this.check([81, 76, 67, 77], { offset: 8 })) {
        return {
          ext: "qcp",
          mime: "audio/qcelp"
        };
      }
    }
    if (this.check([73, 73, 85, 0, 24, 0, 0, 0, 136, 231, 116, 216])) {
      return {
        ext: "rw2",
        mime: "image/x-panasonic-rw2"
      };
    }
    if (this.check([48, 38, 178, 117, 142, 102, 207, 17, 166, 217])) {
      let isMalformedAsf = false;
      try {
        async function readHeader() {
          const guid = new Uint8Array(16);
          await safeReadBuffer(tokenizer, guid, void 0, {
            maximumLength: guid.length,
            reason: "ASF header GUID"
          });
          return {
            id: guid,
            size: Number(await tokenizer.readToken(UINT64_LE))
          };
        }
        await safeIgnore(tokenizer, 30, {
          maximumLength: 30,
          reason: "ASF header prelude"
        });
        const isUnknownFileSize = hasUnknownFileSize(tokenizer);
        const asfHeaderScanStart = tokenizer.position;
        let asfHeaderObjectCount = 0;
        while (tokenizer.position + 24 < tokenizer.fileInfo.size) {
          asfHeaderObjectCount++;
          if (asfHeaderObjectCount > maximumAsfHeaderObjectCount) {
            break;
          }
          if (hasExceededUnknownSizeScanBudget(tokenizer, asfHeaderScanStart, maximumUntrustedSkipSizeInBytes)) {
            break;
          }
          const previousPosition = tokenizer.position;
          const header = await readHeader();
          let payload = header.size - 24;
          if (!Number.isFinite(payload) || payload < 0) {
            isMalformedAsf = true;
            break;
          }
          if (_check(header.id, [145, 7, 220, 183, 183, 169, 207, 17, 142, 230, 0, 192, 12, 32, 83, 101])) {
            const typeId = new Uint8Array(16);
            payload -= await safeReadBuffer(tokenizer, typeId, void 0, {
              maximumLength: typeId.length,
              reason: "ASF stream type GUID"
            });
            if (_check(typeId, [64, 158, 105, 248, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43])) {
              return {
                ext: "asf",
                mime: "audio/x-ms-asf"
              };
            }
            if (_check(typeId, [192, 239, 25, 188, 77, 91, 207, 17, 168, 253, 0, 128, 95, 92, 68, 43])) {
              return {
                ext: "asf",
                mime: "video/x-ms-asf"
              };
            }
            break;
          }
          if (isUnknownFileSize && payload > maximumAsfHeaderPayloadSizeInBytes) {
            isMalformedAsf = true;
            break;
          }
          await safeIgnore(tokenizer, payload, {
            maximumLength: isUnknownFileSize ? maximumAsfHeaderPayloadSizeInBytes : tokenizer.fileInfo.size,
            reason: "ASF header payload"
          });
          if (tokenizer.position <= previousPosition) {
            isMalformedAsf = true;
            break;
          }
        }
      } catch (error) {
        if (error instanceof EndOfStreamError || error instanceof ParserHardLimitError) {
          if (hasUnknownFileSize(tokenizer)) {
            isMalformedAsf = true;
          }
        } else {
          throw error;
        }
      }
      if (isMalformedAsf) {
        return;
      }
      return {
        ext: "asf",
        mime: "application/vnd.ms-asf"
      };
    }
    if (this.check([171, 75, 84, 88, 32, 49, 49, 187, 13, 10, 26, 10])) {
      return {
        ext: "ktx",
        mime: "image/ktx"
      };
    }
    if ((this.check([126, 16, 4]) || this.check([126, 24, 4])) && this.check([48, 77, 73, 69], { offset: 4 })) {
      return {
        ext: "mie",
        mime: "application/x-mie"
      };
    }
    if (this.check([39, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], { offset: 2 })) {
      return {
        ext: "shp",
        mime: "application/x-esri-shape"
      };
    }
    if (this.check([255, 79, 255, 81])) {
      return {
        ext: "j2c",
        mime: "image/j2c"
      };
    }
    if (this.check([0, 0, 0, 12, 106, 80, 32, 32, 13, 10, 135, 10])) {
      await tokenizer.ignore(20);
      const type = await tokenizer.readToken(new StringType(4, "ascii"));
      switch (type) {
        case "jp2 ":
          return {
            ext: "jp2",
            mime: "image/jp2"
          };
        case "jpx ":
          return {
            ext: "jpx",
            mime: "image/jpx"
          };
        case "jpm ":
          return {
            ext: "jpm",
            mime: "image/jpm"
          };
        case "mjp2":
          return {
            ext: "mj2",
            mime: "image/mj2"
          };
        default:
          return;
      }
    }
    if (this.check([255, 10]) || this.check([0, 0, 0, 12, 74, 88, 76, 32, 13, 10, 135, 10])) {
      return {
        ext: "jxl",
        mime: "image/jxl"
      };
    }
    if (this.check([254, 255])) {
      if (this.checkString("<?xml ", { offset: 2, encoding: "utf-16be" })) {
        return {
          ext: "xml",
          mime: "application/xml"
        };
      }
      return void 0;
    }
    if (this.check([208, 207, 17, 224, 161, 177, 26, 225])) {
      return {
        ext: "cfb",
        mime: "application/x-cfb"
      };
    }
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(256, tokenizer.fileInfo.size), mayBeLess: true });
    if (this.check([97, 99, 115, 112], { offset: 36 })) {
      return {
        ext: "icc",
        mime: "application/vnd.iccprofile"
      };
    }
    if (this.checkString("**ACE", { offset: 7 }) && this.checkString("**", { offset: 12 })) {
      return {
        ext: "ace",
        mime: "application/x-ace-compressed"
      };
    }
    if (this.checkString("BEGIN:")) {
      if (this.checkString("VCARD", { offset: 6 })) {
        return {
          ext: "vcf",
          mime: "text/vcard"
        };
      }
      if (this.checkString("VCALENDAR", { offset: 6 })) {
        return {
          ext: "ics",
          mime: "text/calendar"
        };
      }
    }
    if (this.checkString("FUJIFILMCCD-RAW")) {
      return {
        ext: "raf",
        mime: "image/x-fujifilm-raf"
      };
    }
    if (this.checkString("Extended Module:")) {
      return {
        ext: "xm",
        mime: "audio/x-xm"
      };
    }
    if (this.checkString("Creative Voice File")) {
      return {
        ext: "voc",
        mime: "audio/x-voc"
      };
    }
    if (this.check([4, 0, 0, 0]) && this.buffer.length >= 16) {
      const jsonSize = new DataView(this.buffer.buffer).getUint32(12, true);
      if (jsonSize > 12 && this.buffer.length >= jsonSize + 16) {
        try {
          const header = new TextDecoder().decode(this.buffer.subarray(16, jsonSize + 16));
          const json = JSON.parse(header);
          if (json.files) {
            return {
              ext: "asar",
              mime: "application/x-asar"
            };
          }
        } catch {
        }
      }
    }
    if (this.check([6, 14, 43, 52, 2, 5, 1, 1, 13, 1, 2, 1, 1, 2])) {
      return {
        ext: "mxf",
        mime: "application/mxf"
      };
    }
    if (this.checkString("SCRM", { offset: 44 })) {
      return {
        ext: "s3m",
        mime: "audio/x-s3m"
      };
    }
    if (this.check([71]) && this.check([71], { offset: 188 })) {
      return {
        ext: "mts",
        mime: "video/mp2t"
      };
    }
    if (this.check([71], { offset: 4 }) && this.check([71], { offset: 196 })) {
      return {
        ext: "mts",
        mime: "video/mp2t"
      };
    }
    if (this.check([66, 79, 79, 75, 77, 79, 66, 73], { offset: 60 })) {
      return {
        ext: "mobi",
        mime: "application/x-mobipocket-ebook"
      };
    }
    if (this.check([68, 73, 67, 77], { offset: 128 })) {
      return {
        ext: "dcm",
        mime: "application/dicom"
      };
    }
    if (this.check([76, 0, 0, 0, 1, 20, 2, 0, 0, 0, 0, 0, 192, 0, 0, 0, 0, 0, 0, 70])) {
      return {
        ext: "lnk",
        mime: "application/x.ms.shortcut"
        // Invented by us
      };
    }
    if (this.check([98, 111, 111, 107, 0, 0, 0, 0, 109, 97, 114, 107, 0, 0, 0, 0])) {
      return {
        ext: "alias",
        mime: "application/x.apple.alias"
        // Invented by us
      };
    }
    if (this.checkString("Kaydara FBX Binary  \0")) {
      return {
        ext: "fbx",
        mime: "application/x.autodesk.fbx"
        // Invented by us
      };
    }
    if (this.check([76, 80], { offset: 34 }) && (this.check([0, 0, 1], { offset: 8 }) || this.check([1, 0, 2], { offset: 8 }) || this.check([2, 0, 2], { offset: 8 }))) {
      return {
        ext: "eot",
        mime: "application/vnd.ms-fontobject"
      };
    }
    if (this.check([6, 6, 237, 245, 216, 29, 70, 229, 189, 49, 239, 231, 254, 116, 183, 29])) {
      return {
        ext: "indd",
        mime: "application/x-indesign"
      };
    }
    if (this.check([255, 255, 0, 0, 7, 0, 0, 0, 4, 0, 0, 0, 1, 0, 1, 0]) || this.check([0, 0, 255, 255, 0, 0, 0, 7, 0, 0, 0, 4, 0, 1, 0, 1])) {
      return {
        ext: "jmp",
        mime: "application/x-jmp-data"
      };
    }
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(512, tokenizer.fileInfo.size), mayBeLess: true });
    if (this.checkString("ustar", { offset: 257 }) && (this.checkString("\0", { offset: 262 }) || this.checkString(" ", { offset: 262 })) || this.check([0, 0, 0, 0, 0, 0], { offset: 257 }) && tarHeaderChecksumMatches(this.buffer)) {
      return {
        ext: "tar",
        mime: "application/x-tar"
      };
    }
    if (this.check([255, 254])) {
      const encoding = "utf-16le";
      if (this.checkString("<?xml ", { offset: 2, encoding })) {
        return {
          ext: "xml",
          mime: "application/xml"
        };
      }
      if (this.check([255, 14], { offset: 2 }) && this.checkString("SketchUp Model", { offset: 4, encoding })) {
        return {
          ext: "skp",
          mime: "application/vnd.sketchup.skp"
        };
      }
      if (this.checkString("Windows Registry Editor Version 5.00\r\n", { offset: 2, encoding })) {
        return {
          ext: "reg",
          mime: "application/x-ms-regedit"
        };
      }
      return void 0;
    }
    if (this.checkString("-----BEGIN PGP MESSAGE-----")) {
      return {
        ext: "pgp",
        mime: "application/pgp-encrypted"
      };
    }
  };
  // Detections with limited supporting data, resulting in a higher likelihood of false positives
  detectImprecise = async (tokenizer) => {
    this.buffer = new Uint8Array(reasonableDetectionSizeInBytes);
    const fileSize = getKnownFileSizeOrMaximum(tokenizer.fileInfo.size);
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(8, fileSize), mayBeLess: true });
    if (this.check([0, 0, 1, 186]) || this.check([0, 0, 1, 179])) {
      return {
        ext: "mpg",
        mime: "video/mpeg"
      };
    }
    if (this.check([0, 1, 0, 0, 0])) {
      return {
        ext: "ttf",
        mime: "font/ttf"
      };
    }
    if (this.check([0, 0, 1, 0])) {
      return {
        ext: "ico",
        mime: "image/x-icon"
      };
    }
    if (this.check([0, 0, 2, 0])) {
      return {
        ext: "cur",
        mime: "image/x-icon"
      };
    }
    await tokenizer.peekBuffer(this.buffer, { length: Math.min(2 + this.options.mpegOffsetTolerance, fileSize), mayBeLess: true });
    if (this.buffer.length >= 2 + this.options.mpegOffsetTolerance) {
      for (let depth = 0; depth <= this.options.mpegOffsetTolerance; ++depth) {
        const type = this.scanMpeg(depth);
        if (type) {
          return type;
        }
      }
    }
  };
  async readTiffTag(bigEndian) {
    const tagId = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
    await this.tokenizer.ignore(10);
    switch (tagId) {
      case 50341:
        return {
          ext: "arw",
          mime: "image/x-sony-arw"
        };
      case 50706:
        return {
          ext: "dng",
          mime: "image/x-adobe-dng"
        };
    }
  }
  async readTiffIFD(bigEndian) {
    const numberOfTags = await this.tokenizer.readToken(bigEndian ? UINT16_BE : UINT16_LE);
    if (numberOfTags > maximumTiffTagCount) {
      return;
    }
    if (hasUnknownFileSize(this.tokenizer) && 2 + numberOfTags * 12 > maximumTiffIfdOffsetInBytes) {
      return;
    }
    for (let n = 0; n < numberOfTags; ++n) {
      const fileType = await this.readTiffTag(bigEndian);
      if (fileType) {
        return fileType;
      }
    }
  }
  async readTiffHeader(bigEndian) {
    const tiffFileType = {
      ext: "tif",
      mime: "image/tiff"
    };
    const version = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 2);
    const ifdOffset = (bigEndian ? UINT32_BE : UINT32_LE).get(this.buffer, 4);
    if (version === 42) {
      if (ifdOffset >= 6) {
        if (this.checkString("CR", { offset: 8 })) {
          return {
            ext: "cr2",
            mime: "image/x-canon-cr2"
          };
        }
        if (ifdOffset >= 8) {
          const someId1 = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 8);
          const someId2 = (bigEndian ? UINT16_BE : UINT16_LE).get(this.buffer, 10);
          if (someId1 === 28 && someId2 === 254 || someId1 === 31 && someId2 === 11) {
            return {
              ext: "nef",
              mime: "image/x-nikon-nef"
            };
          }
        }
      }
      if (hasUnknownFileSize(this.tokenizer) && ifdOffset > maximumTiffStreamIfdOffsetInBytes) {
        return tiffFileType;
      }
      const maximumTiffOffset = hasUnknownFileSize(this.tokenizer) ? maximumTiffIfdOffsetInBytes : this.tokenizer.fileInfo.size;
      try {
        await safeIgnore(this.tokenizer, ifdOffset, {
          maximumLength: maximumTiffOffset,
          reason: "TIFF IFD offset"
        });
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        throw error;
      }
      let fileType;
      try {
        fileType = await this.readTiffIFD(bigEndian);
      } catch (error) {
        if (error instanceof EndOfStreamError) {
          return;
        }
        throw error;
      }
      return fileType ?? tiffFileType;
    }
    if (version === 43) {
      return tiffFileType;
    }
  }
  /**
  	Scan check MPEG 1 or 2 Layer 3 header, or 'layer 0' for ADTS (MPEG sync-word 0xFFE).
  
  	@param offset - Offset to scan for sync-preamble.
  	@returns {{ext: string, mime: string}}
  	*/
  scanMpeg(offset) {
    if (this.check([255, 224], { offset, mask: [255, 224] })) {
      if (this.check([16], { offset: offset + 1, mask: [22] })) {
        if (this.check([8], { offset: offset + 1, mask: [8] })) {
          return {
            ext: "aac",
            mime: "audio/aac"
          };
        }
        return {
          ext: "aac",
          mime: "audio/aac"
        };
      }
      if (this.check([2], { offset: offset + 1, mask: [6] })) {
        return {
          ext: "mp3",
          mime: "audio/mpeg"
        };
      }
      if (this.check([4], { offset: offset + 1, mask: [6] })) {
        return {
          ext: "mp2",
          mime: "audio/mpeg"
        };
      }
      if (this.check([6], { offset: offset + 1, mask: [6] })) {
        return {
          ext: "mp1",
          mime: "audio/mpeg"
        };
      }
    }
  }
}
new Set(extensions);
new Set(mimeTypes);
async function scanDirectory(directoryHandle) {
  const handles = [];
  for await (const handle of directoryHandle.values()) {
    if (handle.kind === "file") {
      handles.push(handle);
    }
  }
  const items = await Promise.all(
    handles.map(async (handle) => {
      const file = await handle.getFile();
      const type = await fileTypeFromBlob(file);
      return {
        handle,
        sidecars: [],
        mimeType: type?.mime
      };
    })
  );
  const groups = /* @__PURE__ */ new Map();
  for (const item of items) {
    const name = item.handle.name;
    const lastDotIndex = name.lastIndexOf(".");
    const basename = lastDotIndex === -1 ? name : name.substring(0, lastDotIndex);
    let group = groups.get(basename);
    if (!group) {
      group = [];
      groups.set(basename, group);
    }
    group.push(item);
  }
  const result = [];
  for (const groupItems of groups.values()) {
    let primaryItem = groupItems[0];
    if (!primaryItem) {
      continue;
    }
    let bestScore = -1;
    for (const item of groupItems) {
      let score = 0;
      if (item.mimeType?.startsWith("image/")) {
        score = 2;
      } else if (item.mimeType?.startsWith("video/")) {
        score = 2;
      } else {
        score = 1;
      }
      if (score > bestScore) {
        bestScore = score;
        primaryItem = item;
      }
    }
    const sidecars = groupItems.filter((i) => i !== primaryItem);
    sidecars.sort((a, b) => a.handle.name.localeCompare(b.handle.name));
    primaryItem.sidecars = sidecars;
    result.push(primaryItem);
  }
  result.sort((a, b) => a.handle.name.localeCompare(b.handle.name));
  return result;
}
function GalleryProvider({
  children,
  handle
}) {
  const [selectedIndex, setSelectedIndex] = reactExports.useState(0);
  const { data: files } = useSuspenseQuery({
    queryKey: ["gallery", handle],
    queryFn: async () => {
      if (!handle)
        return [];
      return scanDirectory(handle);
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false
  });
  const selectFile = reactExports.useCallback(
    (index) => {
      setSelectedIndex(Math.max(0, Math.min(index, files.length - 1)));
    },
    [files.length]
  );
  const navigateNext = reactExports.useCallback(() => {
    setSelectedIndex((prev) => Math.min(prev + 1, files.length - 1));
  }, [files.length]);
  const navigatePrevious = reactExports.useCallback(() => {
    setSelectedIndex((prev) => Math.max(prev - 1, 0));
  }, []);
  useKeymap("navigateNext", () => {
    if (files.length === 0)
      return;
    navigateNext();
  });
  useKeymap("navigatePrevious", () => {
    if (files.length === 0)
      return;
    navigatePrevious();
  });
  useKeymap("selectFirst", () => {
    if (files.length === 0)
      return;
    selectFile(0);
  });
  useKeymap("selectLast", () => {
    if (files.length === 0)
      return;
    selectFile(files.length - 1);
  });
  const selectedFile = files[selectedIndex] ?? null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    GalleryContext,
    {
      value: {
        files,
        selectedIndex,
        selectFile,
        navigateNext,
        navigatePrevious,
        selectedFile
      },
      children
    }
  );
}
const ImageInfoContext = reactExports.createContext(
  null
);
function useImageInfo() {
  const context = reactExports.use(ImageInfoContext);
  if (!context) {
    throw new Error("useImageInfo must be used within a ImageInfoProvider");
  }
  return context;
}
function ImageInfoProvider({ children }) {
  const [image, setImage] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    ImageInfoContext,
    {
      value: {
        image,
        setImage
      },
      children
    }
  );
}
const LightingContext = reactExports.createContext(null);
function useLighting() {
  const context = reactExports.use(LightingContext);
  if (!context) {
    throw new Error("useLighting must be used within a LightingProvider");
  }
  return context;
}
function LightingProvider({ children }) {
  const [exposure, setExposure] = reactExports.useState(0);
  const [contrast, setContrast] = reactExports.useState(1);
  const [saturation, setSaturation] = reactExports.useState(1);
  const [highlights, setHighlights] = reactExports.useState(0);
  const [shadows, setShadows] = reactExports.useState(0);
  const [whites, setWhites] = reactExports.useState(0);
  const [blacks, setBlacks] = reactExports.useState(0);
  const [tint, setTint] = reactExports.useState(0);
  const [temperature, setTemperature] = reactExports.useState(0);
  const [vibrance, setVibrance] = reactExports.useState(0);
  const [hue, setHue] = reactExports.useState(0);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    LightingContext,
    {
      value: {
        exposure,
        setExposure,
        resetExposure: () => {
          setExposure(0);
        },
        contrast,
        setContrast,
        resetContrast: () => {
          setContrast(1);
        },
        saturation,
        setSaturation,
        resetSaturation: () => {
          setSaturation(1);
        },
        highlights,
        setHighlights,
        resetHighlights: () => {
          setHighlights(0);
        },
        shadows,
        setShadows,
        resetShadows: () => {
          setShadows(0);
        },
        whites,
        setWhites,
        resetWhites: () => {
          setWhites(0);
        },
        blacks,
        setBlacks,
        resetBlacks: () => {
          setBlacks(0);
        },
        tint,
        setTint,
        resetTint: () => {
          setTint(0);
        },
        temperature,
        setTemperature,
        resetTemperature: () => {
          setTemperature(0);
        },
        vibrance,
        setVibrance,
        resetVibrance: () => {
          setVibrance(0);
        },
        hue,
        setHue,
        resetHue: () => {
          setHue(0);
        }
      },
      children
    }
  );
}
const ModalContext = reactExports.createContext(null);
function useModal() {
  const context = reactExports.use(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
function useObjectUrl(blob) {
  const url = reactExports.useMemo(() => {
    if (!blob)
      return void 0;
    return URL.createObjectURL(blob);
  }, [blob]);
  const revoke = reactExports.useCallback(() => {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }, [url]);
  return { url, revoke };
}
function FullscreenModal(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: null });
}
function FullscreenNavigation({ children }) {
  const { navigateNext, navigatePrevious, files } = useGallery();
  const { setModal } = useModal();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative flex h-full w-full items-center justify-center",
      role: "button",
      tabIndex: 0,
      onClick: (e) => {
        if (e.target === e.currentTarget) {
          setModal(void 0);
        }
      },
      onKeyDown: (e) => {
        if (e.key === "Escape") {
          setModal(void 0);
        }
      },
      children: [
        files.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn btn-circle btn-ghost absolute left-4 z-50 text-white",
            onClick: (e) => {
              e.stopPropagation();
              navigatePrevious();
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-8 w-8" })
          }
        ),
        children,
        files.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn btn-circle btn-ghost absolute right-4 z-50 text-white",
            onClick: (e) => {
              e.stopPropagation();
              navigateNext();
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-8 w-8" })
          }
        )
      ]
    }
  );
}
const imageShader = "struct VertexOutput {\n    @builtin(position) position: vec4<f32>,\n    @location(0) uv: vec2<f32>,\n};\n\n@vertex\nfn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {\n    var pos = array<vec2<f32>, 4>(\n    vec2<f32>(-1.0, -1.0),\n    vec2<f32>( 1.0, -1.0),\n    vec2<f32>(-1.0,  1.0),\n    vec2<f32>( 1.0,  1.0)\n  );\n\n    var output: VertexOutput;\n    output.position = vec4<f32>(pos[vertexIndex], 0.0, 1.0);\n    output.uv = pos[vertexIndex] * 0.5 + 0.5;\n    output.uv.y = 1.0 - output.uv.y;\n    return output;\n}\n\nstruct Lighting {\n    params1: vec4<f32>,\n    params2: vec4<f32>,\n    params3: vec4<f32>,\n}\n\n@group(0) @binding(0) var<uniform> lighting: Lighting;\n@group(0) @binding(1) var mySampler: sampler;\n@group(0) @binding(2) var myTexture: texture_2d<f32>;\n\nfn rgb2hsv(c: vec3<f32>) -> vec3<f32> {\n    let K = vec4<f32>(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    let p = mix(vec4<f32>(c.bg, K.wz), vec4<f32>(c.gb, K.xy), step(c.b, c.g));\n    let q = mix(vec4<f32>(p.xyw, c.r), vec4<f32>(c.r, p.yzx), step(p.x, c.r));\n    let d = q.x - min(q.w, q.y);\n    let e = 1.0e-10;\n    return vec3<f32>(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nfn hsv2rgb(c: vec3<f32>) -> vec3<f32> {\n    let K = vec4<f32>(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), c.y);\n}\n\n@fragment\nfn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {\n    var color = textureSample(myTexture, mySampler, uv);\n\n    let exposure = lighting.params1.x;\n    let contrast = lighting.params1.y;\n    let saturation = lighting.params1.z;\n    let vibrance = lighting.params1.w;\n\n    let highlights = lighting.params2.x;\n    let shadows = lighting.params2.y;\n    let whites = lighting.params2.z;\n    let blacks = lighting.params2.w;\n\n    let tint = lighting.params3.x;\n    let temperature = lighting.params3.y;\n    let hue = lighting.params3.z;\n\n    color = vec4<f32>(color.rgb * pow(2.0, exposure), color.a);\n\n    let tempAdj = vec3<f32>(temperature * 0.1, 0.0, -temperature * 0.1);\n    let tintAdj = vec3<f32>(0.0, tint * 0.1, 0.0);\n    color = vec4<f32>(color.rgb + tempAdj + tintAdj, color.a);\n\n    color = vec4<f32>((color.rgb - 0.5) * contrast + 0.5, color.a);\n\n    let luma = dot(color.rgb, vec3<f32>(0.299, 0.587, 0.114));\n\n    if luma > 0.5 {\n        color = vec4<f32>(color.rgb + (1.0 - luma) * highlights * 0.2, color.a);\n    } else {\n        color = vec4<f32>(color.rgb + luma * shadows * 0.2, color.a);\n    }\n\n    color = vec4<f32>(color.rgb * (1.0 + whites * 0.1) + blacks * 0.1, color.a);\n\n    let gray = vec3<f32>(luma);\n    var satColor = mix(gray, color.rgb, saturation);\n\n    let maxComp = max(color.r, max(color.g, color.b));\n    let minComp = min(color.r, min(color.g, color.b));\n    let currentSat = maxComp - minComp;\n    let vib = clamp(vibrance, -1.0, 1.0);\n    let vibStrength = (1.0 - currentSat) * abs(vib);\n    if vib > 0.0 {\n        satColor = mix(satColor, color.rgb, vibStrength);\n    } else if vib < 0.0 {\n        satColor = mix(satColor, gray, vibStrength);\n    }\n\n    color = vec4<f32>(satColor, color.a);\n\n    if hue != 0.0 {\n        var hsv = rgb2hsv(color.rgb);\n        hsv.x = fract(hsv.x + hue);\n        color = vec4<f32>(hsv2rgb(hsv), color.a);\n    }\n\n    color = vec4<f32>(clamp(color.rgb, vec3<f32>(0.0), vec3<f32>(1.0)), color.a);\n\n    return color;\n}\n";
function useImagePipeline(device, format) {
  return useSuspenseQuery({
    queryKey: ["image-pipeline", device, format],
    queryFn: () => {
      if (!device || !format)
        return null;
      const shaderModule = device.createShaderModule({
        code: imageShader
      });
      return device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vs_main"
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [
            {
              format,
              blend: {
                color: {
                  srcFactor: "src-alpha",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add"
                },
                alpha: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add"
                }
              }
            }
          ]
        },
        primitive: {
          topology: "triangle-strip"
        }
      });
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useImageTexture(device, image) {
  const src2 = image ? image.currentSrc || image.src : null;
  const width = image?.naturalWidth ?? 0;
  const height = image?.naturalHeight ?? 0;
  return useSuspenseQuery({
    queryKey: ["image-texture", device, src2, width, height],
    queryFn: async () => {
      if (!device || !src2 || width <= 0 || height <= 0) {
        return null;
      }
      const response = await fetch(src2);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      const tex = device.createTexture({
        size: [bitmap.width, bitmap.height],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
      });
      device.queue.copyExternalImageToTexture(
        { source: bitmap },
        { texture: tex },
        { width: bitmap.width, height: bitmap.height }
      );
      return tex;
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useImageUniformBuffer(device) {
  const result = useSuspenseQuery({
    queryKey: ["image-uniform-buffer", device],
    queryFn: () => {
      if (!device)
        return null;
      return device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
  reactExports.useEffect(() => {
    return () => {
      result.data?.destroy();
    };
  }, [result.data]);
  return result;
}
function useImageRender(canvasId, image, options) {
  const { device } = useGpuDevice();
  const format = useGpuFormat();
  const pipeline = useImagePipeline(device, format);
  const texture = useImageTexture(device, image);
  const uniformBuffer = useImageUniformBuffer(device);
  return useSuspenseQuery({
    queryKey: [
      "image-render",
      canvasId,
      device,
      format,
      pipeline.data,
      texture.data,
      uniformBuffer.data,
      options?.lighting?.exposure,
      options?.lighting?.contrast,
      options?.lighting?.saturation,
      options?.lighting?.vibrance,
      options?.lighting?.highlights,
      options?.lighting?.shadows,
      options?.lighting?.whites,
      options?.lighting?.blacks,
      options?.lighting?.tint,
      options?.lighting?.temperature,
      options?.lighting?.hue
    ],
    queryFn: () => {
      if (typeof document === "undefined")
        return null;
      const canvas = document.getElementById(canvasId);
      if (!device || !canvas || !format || !pipeline.data || !texture.data || !uniformBuffer.data) {
        return null;
      }
      const context = canvas.getContext("webgpu");
      if (!context) {
        return null;
      }
      context.configure({
        device,
        format,
        alphaMode: "premultiplied"
      });
      const lighting = {
        exposure: options?.lighting?.exposure ?? 0,
        contrast: options?.lighting?.contrast ?? 1,
        saturation: options?.lighting?.saturation ?? 1,
        vibrance: options?.lighting?.vibrance ?? 0,
        highlights: options?.lighting?.highlights ?? 0,
        shadows: options?.lighting?.shadows ?? 0,
        whites: options?.lighting?.whites ?? 0,
        blacks: options?.lighting?.blacks ?? 0,
        tint: options?.lighting?.tint ?? 0,
        temperature: options?.lighting?.temperature ?? 0,
        hue: options?.lighting?.hue ?? 0
      };
      device.queue.writeBuffer(
        uniformBuffer.data,
        0,
        new Float32Array([
          lighting.exposure,
          lighting.contrast,
          lighting.saturation,
          lighting.vibrance,
          lighting.highlights,
          lighting.shadows,
          lighting.whites,
          lighting.blacks,
          lighting.tint,
          lighting.temperature,
          lighting.hue,
          0
        ])
      );
      const bindGroup = device.createBindGroup({
        layout: pipeline.data.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformBuffer.data
            }
          },
          {
            binding: 1,
            resource: device.createSampler({
              magFilter: "linear",
              minFilter: "linear"
            })
          },
          {
            binding: 2,
            resource: texture.data.createView()
          }
        ]
      });
      const commandEncoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();
      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: "clear",
            storeOp: "store"
          }
        ]
      });
      passEncoder.setPipeline(pipeline.data);
      passEncoder.setBindGroup(0, bindGroup);
      passEncoder.draw(4);
      passEncoder.end();
      device.queue.submit([commandEncoder.finish()]);
      return true;
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function ImageRender({
  image,
  className,
  onDoubleClick
}) {
  const canvasId = reactExports.useId();
  const lighting = useLighting();
  useImageRender(canvasId, image, { lighting });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "canvas",
    {
      id: canvasId,
      width: image.naturalWidth,
      height: image.naturalHeight,
      className,
      onDoubleClick
    }
  );
}
function ImageViewer({ fileItem }) {
  const { file } = useFile(fileItem ?? null);
  const { url } = useObjectUrl(file ?? null);
  const { setImage } = useImageInfo();
  const { modal, setModal } = useModal();
  const [loadedImage, setLoadedImage] = reactExports.useState(null);
  const [prevUrl, setPrevUrl] = reactExports.useState(null);
  if (url !== prevUrl) {
    setPrevUrl(url ?? null);
    setLoadedImage(null);
  }
  reactExports.useEffect(() => {
    if (!file || !url || !(fileItem?.mimeType?.startsWith("image/") ?? false)) {
      setImage(null);
    }
  }, [file, url, fileItem?.mimeType, setImage]);
  if (!file || !url)
    return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: fileItem?.mimeType?.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: url,
        alt: fileItem?.handle.name,
        className: "hidden",
        onLoad: (e) => {
          const img = e.currentTarget;
          setLoadedImage(img);
          setImage(img);
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "contents", children: loadedImage ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      ImageRender,
      {
        image: loadedImage,
        className: "animate-fade-in max-h-full max-w-full rounded-lg object-contain shadow-2xl",
        onDoubleClick: () => {
          setModal("fullscreen");
        }
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FullscreenModal,
      {
        open: modal === "fullscreen",
        onClose: () => {
          setModal(void 0);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(FullscreenNavigation, { children: loadedImage && /* @__PURE__ */ jsxRuntimeExports.jsx(
          ImageRender,
          {
            image: loadedImage,
            className: "max-h-full max-w-full object-contain"
          }
        ) })
      }
    )
  ] }) : fileItem?.mimeType?.startsWith("video/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    "video",
    {
      src: url,
      className: "animate-fade-in max-h-full max-w-full rounded-lg shadow-2xl",
      controls: true,
      autoPlay: true,
      loop: true,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("track", { kind: "captions" })
    },
    url
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
    "object",
    {
      data: url,
      type: fileItem?.mimeType,
      className: "animate-fade-in h-full w-full rounded-lg object-contain shadow-2xl",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-4 opacity-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(FileIcon, { type: fileItem?.mimeType, className: "h-32 w-32 opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "m-0 text-xl font-medium", children: "Preview not available for this file type" })
      ] })
    }
  ) });
}
const rafShader = "struct LightingParams {\n    params1: vec4<f32>,\n    params2: vec4<f32>,\n    params3: vec4<f32>,\n    raw: vec4<f32>,\n}\n\n@group(0) @binding(0) var sourceTexture: texture_2d<u32>;\n@group(0) @binding(1) var<uniform> lighting: LightingParams;\n\n@vertex\nfn vs_main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {\n    var positions = array<vec2<f32>, 6>(\n    vec2<f32>(-1.0, -1.0),\n    vec2<f32>( 1.0, -1.0),\n    vec2<f32>(-1.0,  1.0),\n    vec2<f32>(-1.0,  1.0),\n    vec2<f32>( 1.0, -1.0),\n    vec2<f32>( 1.0,  1.0)\n  );\n    let pos = positions[vertexIndex];\n    return vec4<f32>(pos, 0.0, 1.0);\n}\n\nfn clampCoord(c: vec2<i32>, dim: vec2<i32>) -> vec2<i32> {\n    return vec2<i32>(clamp(c.x, 0, dim.x - 1), clamp(c.y, 0, dim.y - 1));\n}\n\nfn rawAt(c: vec2<i32>) -> f32 {\n    let dimU = textureDimensions(sourceTexture);\n    let dim = vec2<i32>(i32(dimU.x), i32(dimU.y));\n    let cc = clampCoord(c, dim);\n    let v = textureLoad(sourceTexture, cc, 0).r;\n    return f32(v);\n}\n\nfn cfaColor(x: i32, y: i32, pattern: i32) -> i32 {\n    let xx = x & 1;\n    let yy = y & 1;\n\n    if pattern == 0 {\n        if yy == 0 && xx == 0 { return 0; }\n        if yy == 0 && xx == 1 { return 1; }\n        if yy == 1 && xx == 0 { return 1; }\n        return 2;\n    }\n    if pattern == 1 {\n        if yy == 0 && xx == 0 { return 2; }\n        if yy == 0 && xx == 1 { return 1; }\n        if yy == 1 && xx == 0 { return 1; }\n        return 0;\n    }\n    if pattern == 2 {\n        if yy == 0 && xx == 0 { return 1; }\n        if yy == 0 && xx == 1 { return 0; }\n        if yy == 1 && xx == 0 { return 2; }\n        return 1;\n    }\n    if yy == 0 && xx == 0 { return 1; }\n    if yy == 0 && xx == 1 { return 2; }\n    if yy == 1 && xx == 0 { return 0; }\n    return 1;\n}\n\nfn demosaicBilinear(x: i32, y: i32, pattern: i32) -> vec3<f32> {\n    let here = rawAt(vec2<i32>(x, y));\n    let color = cfaColor(x, y, pattern);\n\n    if color == 0 {\n        let g = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y)) + rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.25;\n        let b = (rawAt(vec2<i32>(x - 1, y - 1)) + rawAt(vec2<i32>(x + 1, y - 1)) + rawAt(vec2<i32>(x - 1, y + 1)) + rawAt(vec2<i32>(x + 1, y + 1))) * 0.25;\n        return vec3<f32>(here, g, b);\n    }\n\n    if color == 2 {\n        let g = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y)) + rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.25;\n        let r = (rawAt(vec2<i32>(x - 1, y - 1)) + rawAt(vec2<i32>(x + 1, y - 1)) + rawAt(vec2<i32>(x - 1, y + 1)) + rawAt(vec2<i32>(x + 1, y + 1))) * 0.25;\n        return vec3<f32>(r, g, here);\n    }\n\n    var r: f32 = 0.0;\n    var b: f32 = 0.0;\n    let leftColor = cfaColor(x - 1, y, pattern);\n    let rightColor = cfaColor(x + 1, y, pattern);\n    if leftColor == 0 || rightColor == 0 {\n        r = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y))) * 0.5;\n        b = (rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.5;\n    } else {\n        r = (rawAt(vec2<i32>(x, y - 1)) + rawAt(vec2<i32>(x, y + 1))) * 0.5;\n        b = (rawAt(vec2<i32>(x - 1, y)) + rawAt(vec2<i32>(x + 1, y))) * 0.5;\n    }\n    return vec3<f32>(r, here, b);\n}\n\nfn rgb2hsv(c: vec3<f32>) -> vec3<f32> {\n    let K = vec4<f32>(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n    let p = mix(vec4<f32>(c.bg, K.wz), vec4<f32>(c.gb, K.xy), step(c.b, c.g));\n    let q = mix(vec4<f32>(p.xyw, c.r), vec4<f32>(c.r, p.yzx), step(p.x, c.r));\n    let d = q.x - min(q.w, q.y);\n    let e = 1.0e-10;\n    return vec3<f32>(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n}\n\nfn hsv2rgb(c: vec3<f32>) -> vec3<f32> {\n    let K = vec4<f32>(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n    let p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n    return c.z * mix(K.xxx, clamp(p - K.xxx, vec3<f32>(0.0), vec3<f32>(1.0)), c.y);\n}\n\n@fragment\nfn fs_main(@builtin(position) pos: vec4<f32>) -> @location(0) vec4<f32> {\n    let dimU = textureDimensions(sourceTexture);\n    let x = clamp(i32(pos.x), 0, i32(dimU.x) - 1);\n    let y = clamp(i32(pos.y), 0, i32(dimU.y) - 1);\n\n    let maxVal = lighting.raw.x;\n    let pattern = i32(lighting.raw.y + 0.5);\n\n    var rgb = demosaicBilinear(x, y, pattern) / maxVal;\n\n    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));\n\n    let exposure = lighting.params1.x;\n    let contrast = lighting.params1.y;\n    let saturation = lighting.params1.z;\n    let vibrance = lighting.params1.w;\n    let highlights = lighting.params2.x;\n    let shadows = lighting.params2.y;\n    let whites = lighting.params2.z;\n    let blacks = lighting.params2.w;\n    let tint = lighting.params3.x;\n    let temperature = lighting.params3.y;\n    let hueShift = lighting.params3.z;\n\n    rgb = rgb * pow(2.0, exposure);\n\n    let wbR = 1.0 + temperature * 0.5;\n    let wbB = 1.0 - temperature * 0.5;\n    let wbG = 1.0 + tint * 0.5;\n    rgb = vec3<f32>(rgb.r * wbR, rgb.g * wbG, rgb.b * wbB);\n\n    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));\n\n    let mid = vec3<f32>(0.5);\n    rgb = mix(mid, rgb, contrast);\n\n    let luminance = dot(rgb, vec3<f32>(0.299, 0.587, 0.114));\n    let shadowFactor = smoothstep(0.0, 0.5, 1.0 - luminance);\n    let highlightFactor = smoothstep(0.5, 1.0, luminance);\n    rgb = rgb + shadowFactor * (shadows - 1.0) * 0.2;\n    rgb = rgb - highlightFactor * (highlights - 1.0) * 0.2;\n\n    rgb = rgb + (whites - 1.0) * 0.1;\n    rgb = rgb - (blacks - 1.0) * 0.1;\n\n    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));\n\n    var hsv = rgb2hsv(rgb);\n    hsv.x = fract(hsv.x + hueShift);\n    hsv.y = hsv.y * saturation;\n    hsv.y = clamp(hsv.y, 0.0, 1.0);\n\n    let vibBoost = vibrance * (1.0 - hsv.y) * 0.5;\n    hsv.y = clamp(hsv.y + vibBoost, 0.0, 1.0);\n\n    rgb = hsv2rgb(hsv);\n\n    rgb = clamp(rgb, vec3<f32>(0.0), vec3<f32>(1.0));\n    rgb = pow(rgb, vec3<f32>(1.0 / 2.2));\n\n    return vec4<f32>(rgb, 1.0);\n}\n";
const LightingParamsSchema = object({
  exposure: number().default(0),
  contrast: number().default(1),
  saturation: number().default(1),
  vibrance: number().default(0),
  highlights: number().default(1),
  shadows: number().default(1),
  whites: number().default(1),
  blacks: number().default(1),
  tint: number().default(0),
  temperature: number().default(0),
  hue: number().default(0)
});
const CfaPatternSchema = _enum(["RGGB", "BGGR", "GRBG", "GBRG"]).default("RGGB");
const RafRendererOptionsSchema = object({
  lighting: LightingParamsSchema.optional(),
  pattern: CfaPatternSchema.optional()
}).default({});
function patternToId(pattern) {
  switch (pattern) {
    case "RGGB":
      return 0;
    case "BGGR":
      return 1;
    case "GRBG":
      return 2;
    case "GBRG":
      return 3;
  }
}
function useRafDecodedRaster(cfa) {
  return useSuspenseQuery({
    queryKey: ["raf-decoded-raster", cfa],
    queryFn: async () => {
      if (!cfa)
        return null;
      const payload = cfa.getPayload();
      if (!payload)
        return null;
      const littleEndian = payload.getLittleEndian();
      const firstIfdOffset = payload.getFirstIfdOffset(littleEndian);
      if (!firstIfdOffset)
        return null;
      const width = payload.getImageWidth(firstIfdOffset, littleEndian);
      const height = payload.getImageLength(firstIfdOffset, littleEndian);
      const bitsPerSample = payload.getBitsPerSample(firstIfdOffset, littleEndian);
      if (!width || !height || !bitsPerSample)
        return null;
      const payloadBytes = new Uint8Array(
        payload.buffer,
        payload.byteOffset,
        payload.byteLength
      );
      const raster = getRafRasterFromPayload(payloadBytes, width, height);
      if (!raster)
        return null;
      const decoded = decodeRafRasterToU16(raster, width, height);
      if (!decoded)
        return null;
      return { width, height, bitsPerSample, data: decoded };
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useRafPipeline(device, format) {
  return useSuspenseQuery({
    queryKey: ["raf-pipeline", device, format],
    queryFn: () => {
      if (!device || !format)
        return null;
      const shaderModule = device.createShaderModule({ code: rafShader });
      const pipeline = device.createRenderPipeline({
        layout: "auto",
        vertex: {
          module: shaderModule,
          entryPoint: "vs_main"
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{ format }]
        },
        primitive: {
          topology: "triangle-list"
        }
      });
      const bindGroupLayout = pipeline.getBindGroupLayout(0);
      const uniformBuffer = device.createBuffer({
        size: 16 * 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      });
      return { bindGroupLayout, pipeline, uniformBuffer };
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useRafImage(fileItem) {
  return useSuspenseQuery({
    queryKey: ["raf-image", fileItem],
    queryFn: async () => {
      if (!fileItem)
        return null;
      const view = await createRafDataView(fileItem);
      if (!view)
        return null;
      return view.getCfa();
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useRafRender(canvasRef, cfa, options = {}) {
  const { device } = useGpuDevice();
  const format = useGpuFormat();
  const { data: resources } = useRafPipeline(device, format);
  const { data: raster } = useRafDecodedRaster(cfa);
  const resolvedOptions = RafRendererOptionsSchema.parse(options);
  const lighting = LightingParamsSchema.parse(resolvedOptions.lighting ?? {});
  const pattern = CfaPatternSchema.parse(resolvedOptions.pattern);
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !resources || !device || !format || !raster)
      return;
    const { width, height, bitsPerSample, data } = raster;
    if (width <= 0 || height <= 0)
      return;
    if (canvas.width !== width)
      canvas.width = width;
    if (canvas.height !== height)
      canvas.height = height;
    const sourceTexture = device.createTexture({
      size: [width, height],
      format: "r16uint",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
    });
    device.queue.writeTexture(
      { texture: sourceTexture },
      data,
      { bytesPerRow: width * 2 },
      { width, height }
    );
    const context = canvas.getContext("webgpu");
    if (!context)
      return;
    context.configure({
      device,
      format,
      alphaMode: "premultiplied"
    });
    const maxVal = (1 << bitsPerSample) - 1;
    const uniforms = new Float32Array([
      lighting.exposure,
      lighting.contrast,
      lighting.saturation,
      lighting.vibrance,
      lighting.highlights,
      lighting.shadows,
      lighting.whites,
      lighting.blacks,
      lighting.tint,
      lighting.temperature,
      lighting.hue,
      0,
      maxVal,
      patternToId(pattern),
      0,
      0
    ]);
    device.queue.writeBuffer(resources.uniformBuffer, 0, uniforms);
    const bindGroup = device.createBindGroup({
      layout: resources.bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: sourceTexture.createView()
        },
        {
          binding: 1,
          resource: { buffer: resources.uniformBuffer }
        }
      ]
    });
    const commandEncoder = device.createCommandEncoder();
    const pass = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: { r: 0, g: 0, b: 0, a: 1 }
        }
      ]
    });
    pass.setPipeline(resources.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.draw(6);
    pass.end();
    device.queue.submit([commandEncoder.finish()]);
  }, [
    canvasRef,
    device,
    format,
    resources,
    raster,
    lighting.exposure,
    lighting.contrast,
    lighting.saturation,
    lighting.vibrance,
    lighting.highlights,
    lighting.shadows,
    lighting.whites,
    lighting.blacks,
    lighting.tint,
    lighting.temperature,
    lighting.hue,
    pattern
  ]);
}
function RawImageRender({
  fileItem,
  className,
  onDoubleClick
}) {
  const { data: cfa } = useRafImage(fileItem ?? null);
  const canvasRef = reactExports.useRef(null);
  const lighting = useLighting();
  useRafRender(
    canvasRef,
    cfa,
    { lighting }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "canvas",
    {
      ref: canvasRef,
      className,
      onDoubleClick
    }
  );
}
function RawCanvasSkeleton({ className }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `${className ?? ""} flex items-center justify-center bg-zinc-800/50`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-4 border-zinc-500 border-t-transparent" })
    }
  );
}
function RawImageViewer({ fileItem }) {
  const { modal, setModal } = useModal();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      reactExports.Suspense,
      {
        fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(RawCanvasSkeleton, { className: "aspect-square h-full max-h-full w-full max-w-full rounded-lg shadow-2xl" }),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          RawImageRender,
          {
            fileItem,
            onDoubleClick: () => {
              setModal("fullscreen");
            },
            className: "max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      FullscreenModal,
      {
        open: modal === "fullscreen",
        onClose: () => {
          setModal(void 0);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(FullscreenNavigation, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          reactExports.Suspense,
          {
            fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(RawCanvasSkeleton, { className: "h-full max-h-full w-full max-w-full" }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              RawImageRender,
              {
                fileItem,
                className: "max-h-full max-w-full object-contain"
              }
            )
          }
        ) })
      }
    )
  ] });
}
function MainViewer() {
  const { selectedFile, files, selectedIndex, navigateNext, navigatePrevious } = useGallery();
  if (files.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyMainViewer, {});
  }
  const canGoPrevious = selectedIndex > 0;
  const canGoNext = selectedIndex < files.length - 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-base-100 relative flex min-w-0 flex-1 items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "btn btn-circle btn-ghost absolute left-4 z-10 h-12 w-12",
        onClick: navigatePrevious,
        disabled: !canGoPrevious,
        "aria-label": "Previous file",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-8 w-8" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full min-w-0 flex-1 items-center justify-center p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      reactExports.Suspense,
      {
        fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-lg" }),
        children: selectedFile ? /* @__PURE__ */ jsxRuntimeExports.jsx(MainViewerContent, { fileItem: selectedFile }) : null
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "btn btn-circle btn-ghost absolute right-4 z-10 h-12 w-12",
        onClick: navigateNext,
        disabled: !canGoNext,
        "aria-label": "Next file",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-8 w-8" })
      }
    )
  ] });
}
function EmptyMainViewer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-base-200/50 relative flex min-w-0 flex-1 flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 opacity-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ImageOff, { className: "h-16 w-16 opacity-30" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "m-0 text-base font-medium", children: "No files loaded" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "m-0 text-sm opacity-70", children: 'Click "Open Folder" to select a directory' })
  ] }) });
}
function MainViewerContent({ fileItem }) {
  if (fileItem?.mimeType === "image/x-fujifilm-raf") {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(RawImageViewer, { fileItem });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ImageViewer, { fileItem });
}
function ModalProvider({
  children,
  navigate,
  search
}) {
  const { modal } = search;
  const setModal = (newModal) => {
    void navigate({
      search: (prev) => ({ ...prev, modal: newModal })
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ModalContext, { value: { modal, setModal }, children });
}
const Signature1Marker = 2303741511;
const Signature2Marker = 218765834;
const ExifChunkMarker = 1700284774;
class PngDataView extends DataView {
  getExif() {
    let offset = 0;
    if (this.byteLength > 7 && this.getUint32(offset) === Signature1Marker && this.getUint32(offset + 4) === Signature2Marker) {
      offset += 8;
    }
    while (offset < this.byteLength) {
      if (offset + 8 > this.byteLength)
        break;
      const chunkLength = this.getUint32(offset);
      if (this.getUint32(offset + 4) === ExifChunkMarker) {
        return new ExifDataView(
          this.buffer,
          this.byteOffset + offset + 8,
          chunkLength
        );
      }
      offset += 12 + chunkLength;
    }
    return null;
  }
}
const RiffMarker = 1380533830;
const WebPMarker = 1464156752;
const ExifMarker = 1163413830;
class WebPDataView extends DataView {
  getExif() {
    let offset = 0;
    if (this.byteLength > 11 && this.getUint32(offset) === RiffMarker && this.getUint32(offset + 8) === WebPMarker) {
      offset += 12;
    }
    while (offset < this.byteLength) {
      if (offset + 8 > this.byteLength)
        break;
      const chunkId = this.getUint32(offset);
      const chunkLength = this.getUint32(offset + 4, true);
      if (chunkId === ExifMarker) {
        return new ExifDataView(
          this.buffer,
          this.byteOffset + offset + 8,
          chunkLength
        );
      }
      offset += 8 + chunkLength;
      if (chunkLength % 2 !== 0) {
        offset += 1;
      }
    }
    return null;
  }
}
class TiffImageDataView extends TiffDataView {
  getExif() {
    return new ExifDataView(this.buffer, this.byteOffset, this.byteLength);
  }
}
async function createImageDataView(source) {
  const file = await source.handle.getFile();
  switch (source.mimeType) {
    case "image/jpeg":
      return new JpegDataView(await file.arrayBuffer());
    case "image/png":
      return new PngDataView(await file.arrayBuffer());
    case "image/webp":
      return new WebPDataView(await file.arrayBuffer());
    case "image/tiff":
      return new TiffImageDataView(await file.arrayBuffer());
    case "image/x-fujifilm-raf":
      return await createRafDataView(source);
    default:
      return null;
  }
}
function useExif(fileItem) {
  return useSuspenseQuery({
    queryKey: ["exif", fileItem],
    queryFn: async () => {
      if (!fileItem)
        return null;
      const view = await createImageDataView(fileItem);
      if (!view)
        return null;
      let exifView = null;
      if (view instanceof RafDataView) {
        const jpeg = view.getJpegImage();
        if (jpeg) {
          exifView = jpeg.getExif();
        }
      } else {
        exifView = view.getExif();
      }
      return exifView ? exifView.getTagEntries() : null;
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function formatBytes(bytes, locale) {
  if (bytes === 0) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "byte",
      unitDisplay: "narrow"
    }).format(0);
  }
  const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const unitIndex = Math.min(i, units.length - 1);
  const value = bytes / 1024 ** unitIndex;
  const formatter = new Intl.NumberFormat(locale, {
    style: "unit",
    unit: units[unitIndex],
    unitDisplay: "narrow",
    maximumFractionDigits: 1
  });
  return formatter.format(value);
}
const histogramShader = "/**\n * Histogram Compute Shader\n *\n * Goal: Calculate and Normalize color histograms for image analysis.\n *\n * Pass 1 (cs_main):\n * - Iterates over the image pixels.\n * - Counts occurrences of each R, G, B value (0-255).\n * - Uses shared memory (localBins) for fast intra-workgroup counting before merging to global memory.\n *\n * Pass 2 (cs_normalize):\n * - Finds the maximum frequency count across all bins.\n * - Normalizes all bin counts relative to this maximum (0-100 scale).\n * - Crucial for Visualization: Normalization ensures the histogram fits vertically in the UI graph,\n *   regardless of image resolution or pixel count distribution.\n */\n\nstruct Bins {\n    r: array<atomic<u32>, 256>,\n    g: array<atomic<u32>, 256>,\n    b: array<atomic<u32>, 256>,\n}\n\nstruct NormalizedBins {\n    r: array<f32, 256>,\n    g: array<f32, 256>,\n    b: array<f32, 256>,\n}\n\n@group(0) @binding(0) var sourceTexture: texture_2d<f32>;\n@group(0) @binding(1) var<storage, read_write> bins: Bins;\n@group(0) @binding(2) var<storage, read_write> normalized: NormalizedBins;\n\n// localBins is shared memory for the workgroup (L1 cache).\n// We need the global 'bins' buffer to aggregate results from all workgroups.\nvar<workgroup> localBins: Bins;\n\n@compute @workgroup_size(16, 16)\nfn cs_main(\n    @builtin(global_invocation_id) globalId: vec3<u32>,\n    @builtin(local_invocation_index) localIndex: u32\n) {\n    // Initialize local bins\n    atomicStore(&localBins.r[localIndex], 0u);\n    atomicStore(&localBins.g[localIndex], 0u);\n    atomicStore(&localBins.b[localIndex], 0u);\n\n    workgroupBarrier();\n\n    let dimensions = textureDimensions(sourceTexture);\n    let x = globalId.x;\n    let y = globalId.y;\n\n    if x < dimensions.x && y < dimensions.y {\n        let color = textureLoad(sourceTexture, vec2<i32>(i32(x), i32(y)), 0);\n        // Use round and clamp to ensure correct bin index and avoid OOB\n        let r = u32(clamp(round(color.r * 255.0), 0.0, 255.0));\n        let g = u32(clamp(round(color.g * 255.0), 0.0, 255.0));\n        let b = u32(clamp(round(color.b * 255.0), 0.0, 255.0));\n\n        atomicAdd(&localBins.r[r], 1u);\n        atomicAdd(&localBins.g[g], 1u);\n        atomicAdd(&localBins.b[b], 1u);\n    }\n\n    workgroupBarrier();\n\n    // Merge local bins to global bins\n    let rCount = atomicLoad(&localBins.r[localIndex]);\n    let gCount = atomicLoad(&localBins.g[localIndex]);\n    let bCount = atomicLoad(&localBins.b[localIndex]);\n\n    if rCount > 0u { atomicAdd(&bins.r[localIndex], rCount); }\n    if gCount > 0u { atomicAdd(&bins.g[localIndex], gCount); }\n    if bCount > 0u { atomicAdd(&bins.b[localIndex], bCount); }\n}\n\n// Workgroup-shared atomic for parallel max reduction\nvar<workgroup> maxVal: atomic<u32>;\n\n@compute @workgroup_size(256)\nfn cs_normalize(@builtin(local_invocation_id) localId: vec3<u32>) {\n    let i = localId.x;\n\n    if i == 0u {\n        atomicStore(&maxVal, 0u);\n    }\n    workgroupBarrier();\n\n    let rCount = atomicLoad(&bins.r[i]);\n    let gCount = atomicLoad(&bins.g[i]);\n    let bCount = atomicLoad(&bins.b[i]);\n\n    let localMax = max(rCount, max(gCount, bCount));\n    atomicMax(&maxVal, localMax);\n\n    workgroupBarrier();\n\n    let maxCount = f32(atomicLoad(&maxVal));\n\n    if maxCount > 0.0 {\n        // Normalize to 0.0-100.0 range\n        normalized.r[i] = (f32(rCount) / maxCount) * 100.0;\n        normalized.g[i] = (f32(gCount) / maxCount) * 100.0;\n        normalized.b[i] = (f32(bCount) / maxCount) * 100.0;\n    } else {\n        normalized.r[i] = 0.0;\n        normalized.g[i] = 0.0;\n        normalized.b[i] = 0.0;\n    }\n}\n";
function useHistogramComputePipeline(device) {
  return useSuspenseQuery({
    queryKey: ["histogram-compute-pipeline", device],
    queryFn: () => {
      if (!device)
        return null;
      const shaderModule = device.createShaderModule({
        code: histogramShader
      });
      return device.createComputePipeline({
        layout: "auto",
        compute: {
          module: shaderModule,
          entryPoint: "cs_main"
        }
      });
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useHistogramNormalizePipeline(device) {
  return useSuspenseQuery({
    queryKey: ["histogram-normalize-pipeline", device],
    queryFn: () => {
      if (!device)
        return null;
      const shaderModule = device.createShaderModule({
        code: histogramShader
      });
      return device.createComputePipeline({
        layout: "auto",
        compute: {
          module: shaderModule,
          entryPoint: "cs_normalize"
        }
      });
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function useHistogram(image) {
  const { device } = useGpuDevice();
  const computePipeline = useHistogramComputePipeline(device);
  const normalizePipeline = useHistogramNormalizePipeline(device);
  const src2 = image ? image.currentSrc || image.src : null;
  const width = image?.naturalWidth ?? 0;
  const height = image?.naturalHeight ?? 0;
  return useSuspenseQuery({
    queryKey: [
      "histogram",
      device,
      src2,
      width,
      height,
      computePipeline.data,
      normalizePipeline.data
    ],
    queryFn: async () => {
      if (!device || !src2 || width <= 0 || height <= 0)
        return null;
      if (!computePipeline.data || !normalizePipeline.data)
        return null;
      let bitmap = null;
      let texture = null;
      let storageBuffer = null;
      let normalizedBuffer = null;
      let readBuffer = null;
      const bufferSize = 256 * 3 * 4;
      try {
        const response = await fetch(src2);
        const blob = await response.blob();
        try {
          bitmap = await createImageBitmap(blob);
        } catch {
          return null;
        }
        if (bitmap.width <= 0 || bitmap.height <= 0)
          return null;
        texture = device.createTexture({
          size: [bitmap.width, bitmap.height],
          format: "rgba8unorm",
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });
        device.queue.copyExternalImageToTexture(
          { source: bitmap },
          { texture },
          [bitmap.width, bitmap.height]
        );
        storageBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
        normalizedBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
        readBuffer = device.createBuffer({
          size: bufferSize,
          usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
        const bindGroupCompute = device.createBindGroup({
          layout: computePipeline.data.getBindGroupLayout(0),
          entries: [
            { binding: 0, resource: texture.createView() },
            { binding: 1, resource: { buffer: storageBuffer } }
          ]
        });
        const bindGroupNormalize = device.createBindGroup({
          layout: normalizePipeline.data.getBindGroupLayout(0),
          entries: [
            { binding: 1, resource: { buffer: storageBuffer } },
            { binding: 2, resource: { buffer: normalizedBuffer } }
          ]
        });
        const commandEncoder = device.createCommandEncoder();
        const pass1 = commandEncoder.beginComputePass();
        pass1.setPipeline(computePipeline.data);
        pass1.setBindGroup(0, bindGroupCompute);
        pass1.dispatchWorkgroups(
          Math.ceil(bitmap.width / 16),
          Math.ceil(bitmap.height / 16)
        );
        pass1.end();
        const pass2 = commandEncoder.beginComputePass();
        pass2.setPipeline(normalizePipeline.data);
        pass2.setBindGroup(0, bindGroupNormalize);
        pass2.dispatchWorkgroups(1);
        pass2.end();
        commandEncoder.copyBufferToBuffer(
          normalizedBuffer,
          0,
          readBuffer,
          0,
          bufferSize
        );
        device.queue.submit([commandEncoder.finish()]);
        await readBuffer.mapAsync(GPUMapMode.READ);
        const arrayBuffer = readBuffer.getMappedRange();
        const result = new Float32Array(arrayBuffer);
        const r = [...result.slice(0, 256)];
        const g = [...result.slice(256, 512)];
        const b = [...result.slice(512, 768)];
        readBuffer.unmap();
        return { r, g, b };
      } finally {
        bitmap?.close();
        storageBuffer?.destroy();
        normalizedBuffer?.destroy();
        readBuffer?.destroy();
        texture?.destroy();
      }
    },
    retry: 3,
    retryDelay,
    staleTime: Infinity
  });
}
function HistogramSkeleton({ className = "" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `relative flex h-32 w-full items-center justify-center overflow-hidden rounded-md bg-zinc-800/50 ${className}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-4 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" })
    }
  );
}
function HistogramContent({
  className = "",
  image
}) {
  const { data } = useHistogram(image);
  if (!data)
    return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: `relative h-32 w-full overflow-hidden rounded-md bg-black ${className}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "svg",
        {
          viewBox: "0 0 256 100",
          preserveAspectRatio: "none",
          className: "absolute inset-0 h-full w-full",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                d: `M0,100 ${data.r.map((v, i) => `L${i.toString()},${(100 - v).toString()}`).join(" ")} L255,100 Z`,
                fill: "#ff0000",
                className: "opacity-80",
                style: { mixBlendMode: "screen" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                d: `M0,100 ${data.g.map((v, i) => `L${i.toString()},${(100 - v).toString()}`).join(" ")} L255,100 Z`,
                fill: "#00ff00",
                className: "opacity-80",
                style: { mixBlendMode: "screen" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                d: `M0,100 ${data.b.map((v, i) => `L${i.toString()},${(100 - v).toString()}`).join(" ")} L255,100 Z`,
                fill: "#0000ff",
                className: "opacity-80",
                style: { mixBlendMode: "screen" }
              }
            )
          ] })
        }
      )
    }
  );
}
function Histogram({ className = "" }) {
  const { image } = useImageInfo();
  if (!image)
    return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(HistogramSkeleton, { className }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(HistogramContent, { className, image }) });
}
function Sidebar() {
  const { selectedFile } = useGallery();
  const { data } = useLiveQuery(
    (q) => q.from({ settings: settingsCollection }).where(({ settings }) => eq(settings.id, "sidebarCollapsed")).findOne()
  );
  const isCollapsed = data?.value || false;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "aside",
    {
      className: `bg-base-200 border-base-300 relative shrink-0 border-l transition-all duration-250 ${isCollapsed ? "w-8" : "w-70"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn btn-sm btn-square absolute top-1/2 -left-3 z-5 h-8 min-h-0 w-6 -translate-y-1/2 rounded-none rounded-l-md border-r-0",
            onClick: () => {
              if (data) {
                settingsCollection.update("sidebarCollapsed", (draft) => {
                  draft.value = !isCollapsed;
                });
              } else {
                settingsCollection.insert({
                  id: "sidebarCollapsed",
                  value: !isCollapsed
                });
              }
            },
            "aria-label": isCollapsed ? "Expand sidebar" : "Collapse sidebar",
            children: isCollapsed ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Activity, { mode: isCollapsed ? "hidden" : "visible", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full overflow-y-auto p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          reactExports.Suspense,
          {
            fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full items-center justify-center py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-md opacity-50" }) }),
            children: selectedFile ? /* @__PURE__ */ jsxRuntimeExports.jsx(SidebarContent, { fileItem: selectedFile }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EmptySidebar, {})
          }
        ) }) })
      ]
    }
  );
}
function EmptySidebar() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "py-5 text-center text-sm opacity-50", children: "No image selected" });
}
function SidebarContent({ fileItem }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(GeneralSection, { fileItem }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LightingSection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CameraSection, { fileItem }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GroupedFilesSection, { fileItem })
  ] });
}
function LightingSection() {
  const {
    exposure,
    setExposure,
    resetExposure,
    contrast,
    setContrast,
    resetContrast,
    saturation,
    setSaturation,
    resetSaturation,
    highlights,
    setHighlights,
    resetHighlights,
    shadows,
    setShadows,
    resetShadows,
    whites,
    setWhites,
    resetWhites,
    blacks,
    setBlacks,
    resetBlacks,
    tint,
    setTint,
    resetTint,
    temperature,
    setTemperature,
    resetTemperature,
    vibrance,
    setVibrance,
    resetVibrance,
    hue,
    setHue,
    resetHue
  } = useLighting();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CollapsibleSection,
    {
      title: "Lighting",
      id: "sidebarSectionCollapsedLighting",
      icon: Sun,
      className: "mt-8",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Exposure",
            value: exposure,
            min: -5,
            max: 5,
            step: 0.05,
            onChange: setExposure,
            onDoubleClick: resetExposure
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Contrast",
            value: contrast,
            min: 0,
            max: 2,
            step: 0.01,
            onChange: setContrast,
            onDoubleClick: resetContrast
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Saturation",
            value: saturation,
            min: 0,
            max: 2,
            step: 0.01,
            onChange: setSaturation,
            onDoubleClick: resetSaturation
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Highlights",
            value: highlights,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setHighlights,
            onDoubleClick: resetHighlights
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Shadows",
            value: shadows,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setShadows,
            onDoubleClick: resetShadows
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Whites",
            value: whites,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setWhites,
            onDoubleClick: resetWhites
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Blacks",
            value: blacks,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setBlacks,
            onDoubleClick: resetBlacks
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Tint",
            value: tint,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setTint,
            onDoubleClick: resetTint
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Temperature",
            value: temperature,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setTemperature,
            onDoubleClick: resetTemperature
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Vibrance",
            value: vibrance,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setVibrance,
            onDoubleClick: resetVibrance
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            label: "Hue",
            value: hue,
            min: -1,
            max: 1,
            step: 0.01,
            onChange: setHue,
            onDoubleClick: resetHue
          }
        )
      ] })
    }
  );
}
function Slider({
  label,
  value,
  min: min2,
  max: max2,
  step,
  onChange,
  onDoubleClick
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-medium opacity-70", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs opacity-50", children: value.toFixed(2) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type: "range",
        "aria-label": label,
        min: min2,
        max: max2,
        step,
        value,
        onChange: (e) => {
          onChange(Number.parseFloat(e.target.value));
        },
        onDoubleClick: () => {
          if (onDoubleClick) {
            onDoubleClick();
          }
        },
        className: "range range-xs"
      }
    )
  ] });
}
function GeneralSection({ fileItem }) {
  const { handle } = fileItem;
  const { file } = useFile(fileItem);
  const { image } = useImageInfo();
  if (!file)
    return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    CollapsibleSection,
    {
      title: "Info",
      id: "sidebarSectionCollapsedInfo",
      icon: Info,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-base-300 rounded-box mb-5 flex h-32 items-center justify-center overflow-hidden", children: fileItem.mimeType?.startsWith("image/") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Histogram, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full w-full items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileIcon, { type: fileItem.mimeType, className: "h-8 w-8 opacity-50" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "m-0 flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "Filename" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "m-0 text-sm font-medium break-all", title: handle.name, children: handle.name })
          ] }),
          image && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "Dimensions" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "m-0 text-sm font-medium", children: [
              image.naturalWidth,
              " ",
              "×",
              image.naturalHeight
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "File Size" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "m-0 text-sm font-medium", children: formatBytes(file.size) })
          ] })
        ] })
      ]
    }
  );
}
function CameraSection({ fileItem }) {
  const { data: exif } = useExif(fileItem);
  if (!exif || exif.length === 0)
    return null;
  const tags = Object.fromEntries(exif.map((e) => [e.tagId, e.value]));
  const make = tags[MakeTagId];
  const model = tags[ModelTagId];
  const lensModel = tags[LensModelTagId];
  const fNumber = tags[FNumberTagId];
  const exposureTime = tags[ExposureTimeTagId];
  const iso = tags[ISOTagId];
  const focalLength = tags[FocalLengthTagId];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CollapsibleSection,
    {
      title: "Camera",
      id: "sidebarSectionCollapsedCamera",
      icon: Camera,
      className: "mt-8",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("dl", { className: "m-0 flex flex-col gap-4", children: [
        (make ?? model) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "Camera" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "m-0 text-sm font-medium", children: [make, model].filter(Boolean).join(" ") })
        ] }),
        lensModel && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "Lens" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "m-0 text-sm font-medium", children: lensModel })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          fNumber && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "Aperture" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "m-0 text-sm font-medium", children: [
              "f/",
              fNumber
            ] })
          ] }),
          exposureTime && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "Shutter" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "m-0 text-sm font-medium", children: [
              exposureTime >= 1 ? exposureTime : `1/${Math.round(1 / exposureTime).toString()}`,
              "s"
            ] })
          ] }),
          iso && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "ISO" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("dd", { className: "m-0 text-sm font-medium", children: iso })
          ] }),
          focalLength && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("dt", { className: "text-[11px] font-bold tracking-wider uppercase opacity-50", children: "Focal Length" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("dd", { className: "m-0 text-sm font-medium", children: [
              focalLength,
              "mm"
            ] })
          ] })
        ] })
      ] })
    }
  );
}
function GroupedFilesSection({ fileItem }) {
  const { sidecars } = fileItem;
  if (sidecars.length === 0)
    return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    CollapsibleSection,
    {
      title: "Grouped Files",
      id: "sidebarSectionCollapsedGroupedFiles",
      className: "mt-8",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: sidecars.map((sidecarItem) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-2 text-sm opacity-70",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileIcon, { type: sidecarItem.mimeType, className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: sidecarItem.handle.name })
          ]
        },
        sidecarItem.handle.name
      )) })
    }
  );
}
function CollapsibleSection({
  title,
  id,
  icon: Icon2,
  children,
  className = ""
}) {
  const { data } = useLiveQuery(
    (q) => q.from({ settings: settingsCollection }).where(({ settings }) => eq(settings.id, id)).findOne()
  );
  const isCollapsed = data?.value || false;
  const isOpen = !isCollapsed;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => {
          if (data) {
            settingsCollection.update(id, (draft) => {
              draft.value = !isCollapsed;
            });
          } else {
            settingsCollection.insert({
              id,
              value: !isCollapsed
            });
          }
        },
        className: "border-base-300 text-base-content/70 mb-5 flex w-full items-center justify-between border-b pb-3 outline-none",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            Icon2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon2, { className: "h-4.5 w-4.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "m-0 text-sm font-bold tracking-wide uppercase", children: title })
          ] }),
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 opacity-50" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: `grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden", children })
      }
    )
  ] });
}
const siGithub = { path: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" };
function SettingsModal(props) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ClientOnly, { fallback: null });
}
function ToolBar() {
  const { modal, setModal } = useModal();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "navbar bg-base-100 border-base-300 h-12 min-h-12 border-b p-0 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBarLogo, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBarStatus, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ToolBarActions,
        {
          onSettingsClick: () => {
            setModal("settings");
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      SettingsModal,
      {
        open: modal === "settings",
        onClose: () => {
          setModal(void 0);
        }
      }
    )
  ] });
}
function ToolBarLogo() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "navbar-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "text-warning h-5 w-5" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-semibold tracking-wide", children: "Fade" })
  ] }) });
}
function ToolBarStatus() {
  const { files, selectedIndex } = useGallery();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "navbar-center", children: files.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm tabular-nums opacity-70", children: [
    selectedIndex + 1,
    " ",
    "/",
    files.length
  ] }) });
}
function ToolBarActions({ onSettingsClick }) {
  const { select, isSupported } = useDirectory();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "navbar-end gap-2", children: [
    !isSupported && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "tooltip tooltip-bottom tooltip-warning",
        "data-tip": "Browser support is limited",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            className: "btn btn-sm btn-ghost btn-square text-warning",
            "aria-label": "Warning",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5" })
          }
        )
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        className: "btn btn-sm btn-outline btn-warning gap-2 font-medium",
        onClick: () => {
          void select();
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FolderOpen, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Open Folder" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "a",
      {
        href: "https://github.com/shikanime-studio/websites/tree/main/apps/fade",
        target: "_blank",
        rel: "noopener noreferrer",
        className: "btn btn-sm btn-square btn-ghost",
        "aria-label": "GitHub Repository",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-4.5 w-4.5 fill-current", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: siGithub.path }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        className: "btn btn-sm btn-square btn-ghost",
        onClick: onSettingsClick,
        "aria-label": "Settings",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4.5 w-4.5" })
      }
    )
  ] });
}
function GalleryContainer() {
  const {
    handle
  } = useDirectory();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryProvider, { handle, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-base-100 text-base-content selection:bg-warning selection:text-warning-content flex h-screen flex-col", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ToolBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-0 flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ImageInfoProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(LightingProvider, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MainViewer, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {})
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Filmstrip, {})
  ] }) });
}
function App() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DirectoryProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-screen items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "loading loading-spinner loading-lg text-warning" }) }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(GpuAdapterProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(GpuDeviceProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(ModalProvider, { navigate, search, children: /* @__PURE__ */ jsxRuntimeExports.jsx(GalleryContainer, {}) }) }) }) }) });
}
export {
  App as component
};
