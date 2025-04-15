import { useEffect, useState } from 'react';
import axios from "axios";

const getClinics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/bi/superclinic/get',
                    {timeout: 10000,});

                setData(response.data)
                setLoading(false);
            } catch (error) {
                console.log('failed', error);

                setLoading(false);
            }
        };
        fetchData()
        
    }, []);

    return { loading, setLoading, data, setData };
};

export default getClinics;
