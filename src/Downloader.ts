
import { getDatabase, ref as refDB, get, child } from "firebase/database";
import { getStorage, ref as refStorage, getDownloadURL} from "firebase/storage";
import { FighterObject, TeamObject } from "./BattleObjects";

/*
	Cache and download all (default, todo: make public?) fighter objects from 
	firebase real-time database.
*/
abstract class Loader<T> {
	private readonly cache: Set<string>;
	private readonly assets: Promise<void | [string, T]>[];

	constructor() {
		this.cache = new Set<string>();
		this.assets = [];
	}

	protected abstract get(url: string): Promise<void | [string, T]>;

	add(url?: string) {
		if (url == null || this.cache.has(url)) {
			return;
		}
		this.cache.add(url);
		this.assets.push(this.get(url));
	}

	load() {
		return Promise.all(this.assets).then(assets => 
			Object.fromEntries(assets as [string, T][])
		);
	}
}

class FighterLoader extends Loader<FighterObject> {
	private readonly dbRef;

	constructor() {	
		super();
		this.dbRef = refDB(getDatabase());
	}

	get(url: string): Promise<void | [string, FighterObject]> {
		return get(child(this.dbRef, url)).then(snapshot => {
			if (snapshot.exists()) {
				return [ url, snapshot.val() ] as [string, FighterObject];
			} else {
				throw new Error(`ResourceLoader: ${url} does not exist.`);
			}
		}).catch(console.error);
	}

 	addTeam(team: TeamObject) {
		for (const member of team.team) {
			const id = member.id;
			// TODO: handle custom members
			this.add(id);
		}
	}
}

/* 
	Cache and download all assets from firebase storage.
*/
class StorageLoader extends Loader<string> {
	private readonly storage;

	constructor() {
		super();
		this.storage = getStorage();
	}

	get(url: string): Promise<void | [string, string]> {
		return getDownloadURL(refStorage(this.storage, url)).then(
			result => [ url, result ] as [string, string]
		).catch(console.error);
	}
}

export { FighterLoader, StorageLoader };