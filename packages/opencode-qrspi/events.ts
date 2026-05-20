const artifactOptions = ["research", "designs", "outlines", "plans"];
const qrspiArtifactRegEx = new RegExp(`.opencode/(?:${artifactOptions.join("|")})(?:(/|/[^/]+))?$`);

type Some<T> = {
  status: "some";
  value: T;
};

type None = {
  status: "none";
};

type Option<T> = Some<T> | None;

export function some<T>(value: T): Some<T> {
  return {
    status: "some",
    value,
  };
}

export function none(): None {
  return {
    status: "none",
  };
}

export function isNone<T>(o: Option<T>): o is None {
  return o.status === "none";
}

export function isSome<T>(o: Option<T>): o is Some<T> {
  return o.status === "some";
}

type Matcher = (p: string) => Option<string>;

export function redirect(path: string, to: string, matcher: Matcher): Option<string> {
  const match = matcher(path);
  if (isNone(match)) return match;
  return some(`${to}/${match.value}`);
}

export function matchQrspiPath(p: string): Option<string> {
  const match = p.match(qrspiArtifactRegEx);
  if (match === null) return none();
  return some(match[0]);
}
