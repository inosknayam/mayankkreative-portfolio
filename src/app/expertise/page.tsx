import Layout from "@/components/Layout";
import Competencies from "@/components/Competencies";
import Tools from "@/components/Tools";

export default function ExpertisePage() {
    return (
        <Layout>
            <div className="pt-[90px]">
                <Competencies />
                <Tools />
            </div>
        </Layout>
    );
}
