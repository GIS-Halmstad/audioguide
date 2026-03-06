export const getParamValueFromHash = (param) => {
  try {
    if (typeof param !== "string")
      throw new Error("No parameter name provided to getParamValueFromHash.");

    const paramValue = new URLSearchParams(
      window.location.hash.substring(1)
    ).get(param);
    return (
      paramValue
        ?.split(",") // Try to split…
        .map((e) => e.trim()) // …and trim to avoid whitespace.
        .filter((f) => f.length > 0) || [] // Remove any empty elements. Fallback to empty array.
    );
  } catch (error) {
    console.error(error);
    return [];
  }
};
