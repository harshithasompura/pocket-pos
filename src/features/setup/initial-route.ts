export const getInitialRoute = (hasBusiness: boolean): "/setup" | "/(tabs)" => hasBusiness ? "/(tabs)" : "/setup";
