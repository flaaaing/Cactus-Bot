const fs = require("fs");

module.exports = async client => {
	console.log("Ready!");
	const activities = [
		`${client.guilds.cache.size} Servers`,
		`${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)} Users`
	];

	console.log("");
	const cmdArrGlobal = await client.api
		.applications(client.user.id)
		.commands.get();
	cmdArrGlobal.forEach(element => {
		console.log(`Global command loaded : ${element.name} (${element.id})`);
	});

	let i = 0;
	setInterval(
		() =>
			client.user.setActivity(
				`c!help | ${activities[i++ % activities.length]}`,
				{ type: "WATCHING" }
			),
		15000
	);

	setInterval(() => {
		const filtered = client.moderationdb.filter(p => p.isMuted == true);
		const rightNow = Date.now();
		filtered.forEach(async data => {
			const mutedendstime = data.timeMuteEnd;
			if (rightNow > mutedendstime) {
				const serverr = client.guilds.cache.get(data.guildid);
				if (!serverr.members.cache.has(data.userid)) return;
				const member = serverr.members.cache.get(data.userid);
				const muterole = serverr.roles.cache.find(role => {
					return role.name === "Muted";
				});
				member.roles.remove(muterole);
				console.log("removed role");

				await client.moderationdb.set(
					`${data.guildid}-${data.userid}`,
					false,
					"isMuted"
				);
				await client.moderationdb.set(
					`${data.guildid}-${data.userid}`,
					0,
					"timeMuteEnd"
				);
			}
		});
	}, 30000);
};
