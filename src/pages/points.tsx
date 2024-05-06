import type { NextPage } from "next";

const Points: NextPage = () => {
  return <div className="bg-black flex flex-col w-full min-h-screen text-white items-center">
			<h2>Current Standings</h2>
			<table>
				<tr><td>Reade</td><td>42.50</td></tr>
				<tr><td>Art</td><td>40</td></tr>
				<tr><td>Lindsey</td><td>33</td></tr>
				<tr><td>Mr. Harley Sucks Dick For a Living</td><td>40.50</td></tr>
			</table>
    </div>
};

export default Points;