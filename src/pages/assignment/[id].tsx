import type { InferGetServerSidePropsType, NextPage } from "next";
import { ssr } from "../../server/db/ssr";
import Assignment from "../../components/Assignment";
import { HiChevronLeft } from "react-icons/hi";
import Link from "next/link";
import GameSegment from "../../components/GameSegment";
export async function getServerSideProps({ params }: { params: { id: string } }) {
	const id = params.id;
	const assignment = await ssr.getAssignment(id);
	return {
		props: {
			assignment: JSON.parse(JSON.stringify(assignment))
		}
	}
}

const AssignmentPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ assignment }) => {

	if (!assignment) return null;

	return (
		<div className="flex flex-col items-center">
			<div className="flex flex-col m-4 p-4 text-2xl items-center">
				<Link href="/">
					<HiChevronLeft className="inline-block m-2" />
					Back
				</Link>
				<Assignment assignment={assignment} />
			</div>
			<GameSegment assignment={assignment} />
		</div>
	)
}
export default AssignmentPage;