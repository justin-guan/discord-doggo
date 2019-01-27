export class Collection<K, V> extends Map<K, V> {
  public some(predicate: (vc: V) => boolean): boolean {
    for (const entry of this.entries()) {
      if (predicate(entry[1])) {
        return true;
      }
    }
    return false;
  }

  public map<T>(predicate: (vc: V) => T): T[] {
    const mapped: T[] = [];
    for (const entry of this.entries()) {
      mapped.push(predicate(entry[1]));
    }
    return mapped;
  }

  public find(predicate: (vc: V) => boolean): V {
    for (const entry of this.entries()) {
      if (predicate(entry[1])) {
        return entry[1];
      }
    }
    return (null as unknown) as V;
  }
}
