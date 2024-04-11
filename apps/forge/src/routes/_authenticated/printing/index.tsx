import {createFileRoute} from "@tanstack/react-router";
import Title from "../../../components/title";

const PrintingAppIndexComponent = () => {

    return (
        <>
            <Title prompt="Printing App"/>
            <div className="p-2">
                <h3>Printing App</h3>
            </div>
        </>
    )
}

export const Route = createFileRoute('/_authenticated/printing/')({component: PrintingAppIndexComponent})