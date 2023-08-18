export type VersionType = 'major' | 'minor' | 'patch' | 'none';
export interface Release {
    name: string;
    type: VersionType;
}
export interface Changeset {
    summary: string;
    releases: Release[];
}
export type NewChangeset = Changeset & {
    id: string;
};
export interface ComprehensiveRelease {
    name: string;
    type: VersionType;
    oldVersion: string;
    newVersion: string;
    changesets: string[];
}
export interface PreState {
    mode: 'pre' | 'exit';
    tag: string;
    initialVersions: Record<string, string>;
    changesets: string[];
}
export interface ReleasePlan {
    changesets: NewChangeset[];
    releases: ComprehensiveRelease[];
    preState: PreState | undefined;
}
export declare const getReleasePlanMessage: (releasePlan: ReleasePlan | null) => string;
